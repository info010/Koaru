import Database from 'better-sqlite3';
const db = new Database('data.db');

// Gerekli tabloları oluştur (varsa oluşturma)
db.prepare(`
  CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mediaId INTEGER NOT NULL,
    episode INTEGER NOT NULL,
    notifiedAt INTEGER NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS animes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mediaId INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    siteUrl TEXT,
    coverImage TEXT,
    firstNotifiedAt INTEGER NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS user_follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    mediaId INTEGER NOT NULL,
    UNIQUE(userId, mediaId)
  )
`).run();

export default db;
