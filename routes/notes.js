// ============================================
// ROUTES/NOTES.JS - Routes API pour les Notes
// ============================================

const express = require('express');
const router = express.Router();
const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes
} = require('../database');

// ============================================
// ENDPOINTS API
// ============================================

// --------------------------------------------
// GET /api/notes - Récupérer toutes les notes
// --------------------------------------------
router.get('/', async (req, res) => {
  try {
    const notes = await getAllNotes();
    
    res.json({
      success: true,
      count: notes.length,
      data: notes
    });
    
  } catch (error) {
    console.error('Erreur GET all notes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des notes'
    });
  }
});

// AVANT la route GET /:id
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le paramètre de recherche "q" est obligatoire'
      });
    }
    
    const results = await searchNotes(q);
     res.json({
      success: true,
      query: q,
      count: results.length,
      data: results
    });
    
  } catch (error) {
    console.error('Erreur SEARCH notes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche'
    });
  }
});

// --------------------------------------------
// GET /api/notes/:id - Récupérer UNE note
// --------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await getNoteById(id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: note
    });
    
  } catch (error) {
    console.error('Erreur GET note by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la note'
    });
  }
});

// --------------------------------------------
// POST /api/notes - Créer une nouvelle note
// --------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le titre est obligatoire'
      });
    }
    
    const newNote = await createNote(title, content || '');
    
    res.status(201).json({
      success: true,
      message: 'Note créée avec succès',
      data: newNote
    });
    
  } catch (error) {
    console.error('Erreur POST note:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la note'
    });
  }
});

// --------------------------------------------
// PUT /api/notes/:id - Modifier une note
// --------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le titre est obligatoire'
      });
    }
    
    // Vérifier que la note existe
    const existingNote = await getNoteById(id);
    if (!existingNote) {
      return res.status(404).json({
        success: false,
        error: 'Note non trouvée'
      });
    }
    
    const result = await updateNote(id, title, content || '');
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Note mise à jour avec succès'
    });
    
  } catch (error) {
    console.error('Erreur PUT note:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification de la note'
    });
  }
});

// --------------------------------------------
// DELETE /api/notes/:id - Supprimer une note
// --------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await deleteNote(id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Note supprimée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur DELETE note:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la note'
    });
  }
});

module.exports = router;

// ============================================
// COMPRENDRE CE FICHIER
// ============================================

/*
API REST - CONVENTIONS :

┌──────────┬─────────────────┬──────────────────────────┐
│ Méthode  │ Endpoint        │ Action                   │
├──────────┼─────────────────┼──────────────────────────┤
│ GET      │ /api/notes      │ Lister toutes les notes  │
│ GET      │ /api/notes/:id  │ Récupérer une note       │
│ POST     │ /api/notes      │ Créer une note           │
│ PUT      │ /api/notes/:id  │ Modifier une note        │
│ DELETE   │ /api/notes/:id  │ Supprimer une note       │
└──────────┴─────────────────┴──────────────────────────┘

CODES HTTP :

200 OK                → Succès
201 Created           → Ressource créée
400 Bad Request       → Données invalides
404 Not Found         → Ressource non trouvée
500 Internal Error    → Erreur serveur

STRUCTURE D'UNE ROUTE :

router.METHOD('PATH', async (req, res) => {
  // 1. Récupérer les données (req.params, req.body)
  // 2. Valider les données
  // 3. Appeler la fonction database
  // 4. Renvoyer la réponse JSON
});

EXEMPLE DE REQUÊTE :

// Frontend (React)
const response = await fetch('http://localhost:5000/api/notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Ma note',
    content: 'Contenu'
  })
});

const data = await response.json();
console.log(data);

// Réponse du serveur
{
  "success": true,
  "message": "Note créée avec succès",
  "data": {
    "id": 1,
    "title": "Ma note",
    "content": "Contenu"
  }
}

ASYNC/AWAIT :

Sans async/await (ancien style) :
getAllNotes()
  .then(notes => res.json(notes))
  .catch(err => res.status(500).json({error: err}));

Avec async/await (moderne) :
try {
  const notes = await getAllNotes();
  res.json(notes);
} catch (err) {
  res.status(500).json({error: err});
}

VALIDATION :

Toujours valider les données avant de les enregistrer :
✅ Titre non vide
✅ Types corrects
✅ Longueur maximale
✅ Caractères autorisés

GESTION D'ERREURS :

try {
  // Code qui peut échouer
} catch (error) {
  // Gérer l'erreur proprement
  console.error(error);
  res.status(500).json({ error: 'Message clair' });
}

TESTER LES ENDPOINTS :

# GET toutes les notes
curl http://localhost:5000/api/notes

# GET une note spécifique
curl http://localhost:5000/api/notes/1

# POST créer une note
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Hello"}'

# PUT modifier une note
curl -X PUT http://localhost:5000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Modifié","content":"Nouveau"}'

# DELETE supprimer une note
curl -X DELETE http://localhost:5000/api/notes/1
*/
