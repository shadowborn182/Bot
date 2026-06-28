require('dotenv').config();
const express = require('express');
const axios = require('axios');
const session = require('cookie-session');
const path = require('path');
const DB = require('../database');

DB.init();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'sess',
  secret: process.env.SESSION_SECRET || 'replace_me',
  maxAge: 24 * 60 * 60 * 1000
}));

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CALLBACK = process.env.OAUTH_CALLBACK_URL;

if (!CLIENT_ID || !CLIENT_SECRET || !CALLBACK) {
  console.warn('DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, OAUTH_CALLBACK_URL not set in .env');
}

const OAUTH_SCOPES = ['identify', 'guilds'];

app.get('/auth/discord', (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK)}&response_type=code&scope=${OAUTH_SCOPES.join('%20')}`;
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');
  try {
    const data = new URLSearchParams();
    data.append('client_id', CLIENT_ID);
    data.append('client_secret', CLIENT_SECRET);
    data.append('grant_type', 'authorization_code');
    data.append('code', code);
    data.append('redirect_uri', CALLBACK);

    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', data.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const token = tokenRes.data.access_token;
    const user = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${token}` } });
    const guilds = await axios.get('https://discord.com/api/users/@me/guilds', { headers: { Authorization: `Bearer ${token}` } });

    // store in session
    req.session.user = user.data;
    req.session.guilds = guilds.data;
    req.session.access_token = token;

    res.redirect('/');
  } catch (err) {
    console.error('oauth callback error', err.response ? err.response.data : err.message);
    res.status(500).send('OAuth error');
  }
});

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) return res.status(401).json({ error: 'not_authenticated' });
  next();
}

// API: returns logged-in user
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

// API: list guilds (only those the user manages)
app.get('/api/guilds', requireAuth, (req, res) => {
  const guilds = (req.session.guilds || []).filter(g => (g.permissions & 0x20) === 0x20); // MANAGE_GUILD
  res.json({ guilds });
});

// API: get guild settings
app.get('/api/guilds/:id/settings', requireAuth, (req, res) => {
  const gid = req.params.id;
  const row = DB.prepare('SELECT * FROM settings WHERE guildId = ?').get(gid);
  res.json({ settings: row || null });
});

// API: update guild settings (writes to DB directly)
app.post('/api/guilds/:id/settings', requireAuth, (req, res) => {
  const gid = req.params.id;
  // verify user is member of the guild in their session
  const allowed = (req.session.guilds || []).some(g => String(g.id) === String(gid) && (g.permissions & 0x20) === 0x20);
  if (!allowed) return res.status(403).json({ error: 'not_allowed' });

  const { prefix, modLogChannelId, automod_enabled } = req.body;
  // upsert settings
  DB.prepare('INSERT OR REPLACE INTO settings (guildId, prefix, modLogChannelId, automod_enabled) VALUES (?, ?, ?, COALESCE((SELECT automod_enabled FROM settings WHERE guildId = ?), 0))').run(gid, prefix || '+', modLogChannelId || null, gid);
  res.json({ ok: true });
});

// simple health
app.get('/health', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
