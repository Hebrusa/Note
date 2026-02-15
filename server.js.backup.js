// backend/server.js

// Charger les variables d'environnement
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS pour la production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Notes - Production',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

app.use('/api/notes', notesRoutes);

// Gestion des erreurs
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trouvé' });
});

app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV}`);
});