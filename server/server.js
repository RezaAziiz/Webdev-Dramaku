require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Config imports
const pool = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tmdbRoutes = require('./routes/tmdbRoutes');
const commentRoutes = require('./routes/commentRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const watchHistoryRoutes = require('./routes/watchHistoryRoutes');

// Middleware imports
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const port = 3005;

// Setup CORS to allow frontend access
app.use(cors());
app.use(express.json());

// Auth Routes
app.use('/', authRoutes);

// User Routes
app.use('/api/users', userRoutes);

// Direct S3 pre-signed upload URL endpoint (matches frontend AWS_CONFIG.UPLOAD_ENDPOINT)
const { authenticateToken } = require('./middlewares/authMiddleware');
const userController = require('./controllers/userController');
app.post('/api/upload-url', authenticateToken, userController.getPresignedUploadUrl);

// TMDB Proxy Routes (titles, search, genres, discover - all live from TMDB)
app.use('/', tmdbRoutes);

// Comment Routes
app.use('/', commentRoutes);

// Watchlist Routes
app.use('/', watchlistRoutes);

// Watch History Routes (continue watching)
app.use('/', watchHistoryRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = { app };
