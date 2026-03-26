const path = require("path");
const Database = require("better-sqlite3");
const { migrateIfNeeded } = require("./migrate.js");

function openDb() {

  const dbPath = path.join(process.cwd(), "Bibliotecadefinitva.db");

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");

  migrateIfNeeded(db);

  db.pragma("foreign_keys = ON");
  return db;
}

module.exports = { openDb };