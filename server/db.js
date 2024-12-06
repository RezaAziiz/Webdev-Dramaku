// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // Ganti dengan user database Anda
  host: 'localhost', // Ganti dengan host database Anda
  database: 'postgres', // Ganti dengan nama database Anda
  password: 'Aziiz_4321', // Ganti dengan password database Anda
  port: 5432, // Default PostgreSQL port
});

module.exports = { pool }; // Perhatikan ekspor di sini
