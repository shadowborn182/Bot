# Server

This Express server provides Discord OAuth2 login and API endpoints for the dashboard. It writes settings directly to the shared SQLite DB (database.js) so the bot can pick them up.

.env variables (server/.env):
- DISCORD_CLIENT_ID
- DISCORD_CLIENT_SECRET
- OAUTH_CALLBACK_URL (e.g. https://yourdomain.com/auth/callback)
- SESSION_SECRET

Run:
1. npm install
2. Fill server/.env
3. npm start (from repo root or run `node server/index.js`)

Note: For production use, run the server alongside the bot process so they can share the same data.sqlite, or configure a shared DB.
