import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'loja-chaves.db';
let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database !== null) {
    return database;
  }
  database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await runMigrations(database);
  return database;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS products (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      category   TEXT    NOT NULL DEFAULT '',
      model      TEXT    NOT NULL DEFAULT '',
      barcode    TEXT    UNIQUE,
      costPrice  REAL    NOT NULL DEFAULT 0,
      salePrice  REAL    NOT NULL DEFAULT 0,
      quantity   INTEGER NOT NULL DEFAULT 0,
      minStock   INTEGER NOT NULL DEFAULT 5,
      photoUri   TEXT,
      createdAt  TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      createdAt     TEXT    NOT NULL,
      total         REAL    NOT NULL,
      discount      REAL    NOT NULL DEFAULT 0,
      paymentMethod TEXT    NOT NULL,
      status        TEXT    NOT NULL DEFAULT 'concluida'
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      saleId      INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      productId   INTEGER REFERENCES products(id) ON DELETE SET NULL,
      productName TEXT    NOT NULL,
      quantity    INTEGER NOT NULL,
      unitPrice   REAL    NOT NULL,
      unitCost    REAL    NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      title     TEXT    NOT NULL,
      message   TEXT    NOT NULL,
      type      TEXT    NOT NULL DEFAULT 'info',
      read      INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profile (
      id               INTEGER PRIMARY KEY CHECK (id = 1),
      name             TEXT    NOT NULL DEFAULT '',
      email            TEXT    NOT NULL DEFAULT '',
      storeName        TEXT    NOT NULL DEFAULT '',
      photoUri         TEXT,
      biometricEnabled INTEGER NOT NULL DEFAULT 0,
      cnpj             TEXT    NOT NULL DEFAULT '',
      legalName        TEXT    NOT NULL DEFAULT '',
      address          TEXT    NOT NULL DEFAULT '',
      phone            TEXT    NOT NULL DEFAULT ''
    );
  `);

  // Bancos criados antes da consulta de CNPJ não têm as colunas novas:
  // o CREATE TABLE IF NOT EXISTS não altera tabela existente, então adicionamos aqui.
  await addMissingColumns(db, 'profile', {
    cnpj: "TEXT NOT NULL DEFAULT ''",
    legalName: "TEXT NOT NULL DEFAULT ''",
    address: "TEXT NOT NULL DEFAULT ''",
    phone: "TEXT NOT NULL DEFAULT ''",
  });
}

async function addMissingColumns(
  db: SQLite.SQLiteDatabase,
  table: string,
  columns: Record<string, string>,
): Promise<void> {
  const existing = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  const names = new Set(existing.map((c) => c.name));
  for (const [column, definition] of Object.entries(columns)) {
    if (!names.has(column)) {
      await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  }
}
