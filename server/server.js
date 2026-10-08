const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Config imports
const pool = require('./config/db');
const cloudinary = require('./config/cloudinary');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const commentRoutes = require('./routes/commentRoutes');
const masterRoutes = require('./routes/masterRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');

// Middleware imports
const errorMiddleware = require('./middlewares/errorMiddleware');
const { authenticateToken } = require('./middlewares/authMiddleware');

const app = express();
const port = 3005;

// Setup CORS to allow frontend access
app.use(cors());
app.use(express.json());


const upload = multer({ storage: multer.memoryStorage() }); // Using memory storage for direct upload to Cloudinary

// Auth Routes
app.use('/', authRoutes);

// Movie Routes
app.use('/', movieRoutes);


// Master Routes (Genres, Countries, Awards, Actors)
app.use('/', masterRoutes);

// Watchlist Routes
app.use('/', watchlistRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = {app};
