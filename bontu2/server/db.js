'use strict';
// Uses Node's built-in SQLite (node:sqlite, Node 22.13+). No native modules, no compiler needed.
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const config = require('./config');

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
const raw = new DatabaseSync(config.dbPath);
raw.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

raw.exec(`
CREATE TABLE IF NOT EXISTS bookings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ref         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  package_id  TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  date        TEXT NOT NULL,
  start_min   INTEGER NOT NULL,
  end_min     INTEGER NOT NULL,
  extra_hours INTEGER NOT NULL DEFAULT 0,
  guests      INTEGER NOT NULL,
  area        TEXT NOT NULL,
  address     TEXT NOT NULL,
  notes       TEXT,
  addons      TEXT NOT NULL DEFAULT '[]',
  total       INTEGER NOT NULL,
  deposit     INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  admin_note  TEXT,
  lang        TEXT DEFAULT 'en',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE TABLE IF NOT EXISTS blocked_dates (date TEXT PRIMARY KEY, reason TEXT);
`);

module.exports = {
  prepare: sql => raw.prepare(sql),
  exec: sql => raw.exec(sql),
  // Runs fn atomically. SQLite is synchronous here, so check-then-insert cannot interleave.
  transaction(fn) {
    return (...args) => {
      raw.exec('BEGIN IMMEDIATE');
      try { const r = fn(...args); raw.exec('COMMIT'); return r; }
      catch (e) { raw.exec('ROLLBACK'); throw e; }
    };
  },
};
