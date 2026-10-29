const pool = require('../config/db');

exports.findByUsername = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  return result.rows[0];
};

exports.findByUsernameOrEmail = async (identifier) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1",
    [identifier]
  );
  return result.rows[0];
};

exports.findByGoogleId = async (googleId) => {
  const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
  return result.rows[0];
};

exports.createUser = async (username, email, hashedPassword, role) => {
  const result = await pool.query(
    "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [username, email, hashedPassword, role]
  );
  return result.rows[0];
};

exports.createGoogleUser = async (username, email, googleId, role) => {
  const result = await pool.query(
    "INSERT INTO users (username, email, google_id, role, banned) VALUES ($1, $2, $3, $4, FALSE) RETURNING *",
    [username, email, googleId, role]
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
  const result = await pool.query('UPDATE users SET role = $1 WHERE username = $2 RETURNING *', [role, username]);
  return result.rows[0];
};

exports.updateAvatar = async (username, avatarUrl) => {
  const result = await pool.query(
    'UPDATE users SET avatar_url = $1 WHERE username = $2 RETURNING *',
    [avatarUrl, username]
  );
  return result.rows[0];
};
