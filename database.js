// ============================================
// DATABASE.JS - Version PostgreSQL (Production)
// ============================================

const { Pool } = require('pg');

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Test de connexion
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur connexion PostgreSQL:', err.message);
    process.exit(1);
  }
  console.log('✅ Connecté à PostgreSQL');
  console.log(`📊 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[1] || 'unknown'}`);
  release();
});

// ============================================
// CRÉATION DE LA TABLE
// ============================================

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_notes_search ON notes USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));
`;

pool.query(createTableSQL)
  .then(() => console.log('✅ Table "notes" prête'))
  .catch(err => console.error('❌ Erreur création table:', err.message));

// ============================================
// FONCTIONS CRUD
// ============================================

// GET ALL - Récupérer toutes les notes
const getAllNotes = async () => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes ORDER BY updated_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Erreur getAllNotes:', error);
    throw error;
  }
};

// GET ONE - Récupérer une note par ID
const getNoteById = async (id) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erreur getNoteById:', error);
    throw error;
  }
};

// CREATE - Créer une nouvelle note
const createNote = async (title, content) => {
  try {
    const result = await pool.query(
      'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erreur createNote:', error);
    throw error;
  }
};

// UPDATE - Modifier une note
const updateNote = async (id, title, content) => {
  try {
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erreur updateNote:', error);
    throw error;
  }
};

// DELETE - Supprimer une note
const deleteNote = async (id) => {
  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1',
      [id]
    );
    return result.rowCount;
  } catch (error) {
    console.error('Erreur deleteNote:', error);
    throw error;
  }
};

// SEARCH - Rechercher des notes
const searchNotes = async (query) => {
  try {
    // ILIKE = case-insensitive LIKE (PostgreSQL)
    const result = await pool.query(
      'SELECT * FROM notes WHERE title ILIKE $1 OR content ILIKE $1 ORDER BY updated_at DESC',
      [`%${query}%`]
    );
    return result.rows;
  } catch (error) {
    console.error('Erreur searchNotes:', error);
    throw error;
  }
};

// ============================================
// FERMETURE PROPRE
// ============================================

process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('\n✅ Connexion PostgreSQL fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur fermeture:', error);
    process.exit(1);
  }
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
  pool,
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes
};

// ============================================
// NOTES IMPORTANTES
// ============================================

/*
DIFFÉRENCES SQLite vs PostgreSQL :

1. PARAMÈTRES :
   SQLite : ?
   PostgreSQL : $1, $2, $3

2. AUTO-INCREMENT :
   SQLite : AUTOINCREMENT
   PostgreSQL : SERIAL

3. CASE-INSENSITIVE :
   SQLite : LIKE (déjà case-insensitive)
   PostgreSQL : ILIKE

4. CONNEXION :
   SQLite : fichier local
   PostgreSQL : serveur avec URL

5. TYPE DATES :
   SQLite : DATETIME
   PostgreSQL : TIMESTAMP

MIGRATION DONNÉES :

Si vous avez des données SQLite à migrer :
1. Exportez en SQL
2. Adaptez la syntaxe PostgreSQL
3. Importez via psql ou pgAdmin
*/
