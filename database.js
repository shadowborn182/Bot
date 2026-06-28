const Database = require('better-sqlite3');
const path = require('node:path');
const db = new Database(path.join(__dirname, 'data.sqlite'));

module.exports = {
  db,
  init() {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        guildId TEXT PRIMARY KEY,
        prefix TEXT,
        modLogChannelId TEXT,
        automod_enabled INTEGER DEFAULT 0
      )
    `).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS noprefix (
        userId TEXT,
        guildId TEXT,
        expiresAt INTEGER,
        PRIMARY KEY(userId, guildId)
      )
    `).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS premium (
        guildId TEXT PRIMARY KEY,
        grantedAt INTEGER,
        expiresAt INTEGER
      )
    `).run();

    // other tables can be created by the bot modules if needed
  },
  prepare(sql) {
    return db.prepare(sql);
  }
};
