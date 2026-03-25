/**
 * Inicialización de SQLite con WAL mode para concurrencia
 * Crea todas las tablas necesarias si no existen
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

function initDB() {
  const dbPath = process.env.DB_PATH || './data/climabot.db';
  const dbDir = path.dirname(dbPath);

  // Crear directorio si no existe
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);

  // WAL mode — crítico para concurrencia (n8n escribiendo + API leyendo)
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');

  // Tabla de variantes de recomendaciones (Capa 2)
  db.exec(`
    CREATE TABLE IF NOT EXISTS recomendaciones_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zona TEXT NOT NULL,
      categoria TEXT NOT NULL,
      periodo TEXT NOT NULL,
      variantes TEXT NOT NULL,
      generado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      usado_count INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_zona_cat_per ON recomendaciones_cache(zona, categoria, periodo);
  `);

  // Tabla de alertas de fuentes sociales (Twitter, CONAGUA, etc.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS alertas_sociales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fuente TEXT NOT NULL,
      tipo TEXT NOT NULL,
      zona TEXT,
      contenido TEXT NOT NULL,
      url_fuente TEXT,
      relevancia INTEGER DEFAULT 3,
      procesado INTEGER DEFAULT 0,
      creado_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas_sociales(tipo, creado_at);
    CREATE INDEX IF NOT EXISTS idx_alertas_zona ON alertas_sociales(zona, creado_at);
  `);

  // Tabla de log de generación de variantes (debugging)
  db.exec(`
    CREATE TABLE IF NOT EXISTS log_generacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      zonas_procesadas INTEGER,
      zonas_regeneradas INTEGER,
      zonas_skip INTEGER,
      errores TEXT,
      duracion_ms INTEGER
    );
  `);

  // Tabla de métricas de uso
  db.exec(`
    CREATE TABLE IF NOT EXISTS metricas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      zona TEXT NOT NULL,
      requests INTEGER DEFAULT 0,
      cache_hits INTEGER DEFAULT 0,
      cache_misses INTEGER DEFAULT 0,
      UNIQUE(fecha, zona)
    );
  `);

  // Tabla de alertas de nortes enviadas
  db.exec(`
    CREATE TABLE IF NOT EXISTS alertas_nortes_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zona TEXT NOT NULL,
      categoria TEXT NOT NULL,
      velocidad_kmh REAL,
      enviado_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Base de datos SQLite inicializada con WAL mode');
  return db;
}

function getDB() {
  if (!db) return initDB();
  return db;
}

function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { initDB, getDB, closeDB };
