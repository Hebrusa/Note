// ============================================
// SERVER.JS - Version Production
// ============================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Liste des origines autorisées
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean); // Retire les undefined

    // Autoriser les requêtes sans origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 Origin non autorisée: ${origin}`);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Parser JSON
app.use(express.json());

// Logger (seulement en développement)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Route principale
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Notes - Production Ready ✅',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      notes: '/api/notes',
      search: '/api/notes/search?q=mot',
      health: '/health'
    },
    documentation: 'https://github.com/votre-repo/api-docs'
  });
});

// Routes API
app.use('/api/notes', notesRoutes);

// ============================================
// GESTION DES ERREURS
// ============================================

// 404 - Route non trouvée
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint non trouvé',
    path: req.url,
    suggestion: 'Consultez / pour voir les endpoints disponibles'
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  
  // Ne pas exposer les détails d'erreur en production
  const errorMessage = NODE_ENV === 'production' 
    ? 'Erreur serveur interne' 
    : err.message;
  
  res.status(err.status || 500).json({ 
    success: false,
    error: errorMessage,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🚀 Serveur démarré avec succès !      ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔧 Environnement: ${NODE_ENV}`);
  console.log(`🌐 URL Frontend: ${process.env.FRONTEND_URL || 'Non défini'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'PostgreSQL ✅' : 'Non configuré ❌'}`);
  console.log('\n💡 Appuyez sur Ctrl+C pour arrêter\n');
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('\n📛 SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📛 SIGINT reçu, arrêt du serveur...');
  process.exit(0);
});

// ============================================
// NOTES POUR LE DÉPLOIEMENT
// ============================================

/*
VARIABLES D'ENVIRONNEMENT REQUISES :

Production (Railway/Render) :
- DATABASE_URL : URL PostgreSQL (automatique sur Railway)
- FRONTEND_URL : https://votre-app.vercel.app
- NODE_ENV : production
- PORT : (automatique sur la plupart des plateformes)

Développement Local :
- Créez un fichier .env :
  DATABASE_URL=postgresql://user:password@localhost:5432/notes
  FRONTEND_URL=http://localhost:3000
  NODE_ENV=development
  PORT=5000

DÉPLOIEMENT :

Railway :
1. Pushez le code sur GitHub
2. Créez un nouveau projet Railway
3. Ajoutez PostgreSQL au projet
4. Railway détecte automatiquement Node.js
5. Configurez FRONTEND_URL dans les variables

Render :
1. Créez un nouveau Web Service
2. Connectez votre repo GitHub
3. Build Command : npm install
4. Start Command : npm start
5. Ajoutez PostgreSQL (Add-on)
6. Configurez les variables d'environnement

CORS :
Le CORS est configuré pour accepter :
- L'URL de production du frontend
- localhost:3000 (développement)

Si vous avez des erreurs CORS :
1. Vérifiez que FRONTEND_URL est correct
2. Vérifiez que l'origine correspond EXACTEMENT (https, pas de / final)
3. Regardez les logs pour voir quelle origin est rejetée
*/
