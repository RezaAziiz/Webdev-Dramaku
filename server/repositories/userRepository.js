const pool = require('../config/db');

exports.findByUsername = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  return result.rows[0];
};

exports.findByGoogleId = async (googleId) => {
  const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
  return result.rows[0];
};

exports.createUser = async (username, email, hashedPassword, role) => {
  const result = await pool.query(
    "INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [username, email, hashedPassword, role]
  );
  return result.rows[0];
};

exports.createGoogleUser = async (username, email, googleId) => {
  const result = await pool.query(
    "INSERT INTO users (username, email, google_id, role_id, banned) VALUES ($1, $2, $3, 'Writer', FALSE) RETURNING *",
    [username, email, googleId]
  );
  return result.rows[0];
};

exports.getAllActiveUsers = async () => {
  const result = await pool.query('SELECT * FROM users WHERE banned = false ORDER BY username ASC');
  return result.rows;
};

exports.banUser = async (username) => {
  const result = await pool.query('UPDATE users SET banned = true WHERE username = $1 RETURNING *', [username]);
  return result.rows[0];
};

exports.updateRole = async (username, role) => {
  const result = await pool.query('UPDATE users SET role_id = $1 WHERE username = $2 RETURNING *', [role, username]);
  return result.rows[0];
};
