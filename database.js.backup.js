// backend/database.js (version PostgreSQL)

const { Pool } = require('pg');

// Connexion à PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur connexion PostgreSQL:', err);
    return;
  }
  console.log('✅ Connecté à PostgreSQL');
  release();
});

// Créer la table (si elle n'existe pas)
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableSQL, (err) => {
  if (err) {
    console.error('❌ Erreur création table:', err);
  } else {
    console.log('✅ Table "notes" prête');
  }
});

// Fonctions CRUD (identiques à SQLite, juste la syntaxe change)

const getAllNotes = async () => {
  const result = await pool.query('SELECT * FROM notes ORDER BY updated_at DESC');
  return result.rows;
};

const getNoteById = async (id) => {
  const result = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
  return result.rows[0];
};

const createNote = async (title, content) => {
  const result = await pool.query(
    'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
    [title, content]
  );
  return result.rows[0];
};

const updateNote = async (id, title, content) => {
  const result = await pool.query(
    'UPDATE notes SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [title, content, id]
  );
  return result.rows[0];
};

const deleteNote = async (id) => {
  const result = await pool.query('DELETE FROM notes WHERE id = $1', [id]);
  return result.rowCount;
};

const searchNotes = async (query) => {
  const result = await pool.query(
    'SELECT * FROM notes WHERE title ILIKE $1 OR content ILIKE $1 ORDER BY updated_at DESC',
    [`%${query}%`]
  );
  return result.rows;
};

module.exports = {
  pool,
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes
};