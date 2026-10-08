const pool = require('../config/db');

// Genres
exports.getGenres = async () => {
  const result = await pool.query('SELECT id, name FROM genres ORDER BY name ASC;');
  return result.rows;
};

exports.addGenre = async (name) => {
  const result = await pool.query('INSERT INTO genres (name) VALUES ($1) RETURNING *', [name]);
  return result.rows[0];
};

exports.updateGenre = async (id, name) => {
  const result = await pool.query('UPDATE genres SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
  return result.rowCount > 0 ? result.rows[0] : null;
};

exports.deleteGenre = async (id) => {
  await pool.query('DELETE FROM movie_genre WHERE genre_id = $1', [id]);
  const result = await pool.query('DELETE FROM genres WHERE id = $1 RETURNING *', [id]);
  return result.rowCount > 0;
};

// Countries
exports.getCountries = async () => {
  const result = await pool.query('SELECT * FROM countries ORDER BY id DESC');
  return result.rows;
};

exports.addCountry = async (name) => {
  const result = await pool.query('INSERT INTO countries (name) VALUES ($1) RETURNING *', [name]);
  return result.rows[0];
};

exports.updateCountry = async (id, name) => {
  const result = await pool.query('UPDATE countries SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
  return result.rowCount > 0 ? result.rows[0] : null;
};

exports.deleteCountry = async (id) => {
  await pool.query('UPDATE actors SET country_id = NULL WHERE country_id = $1', [id]);
  await pool.query('UPDATE movies SET country_id = NULL WHERE country_id = $1', [id]);
  await pool.query('UPDATE awards SET country_id = NULL WHERE country_id = $1', [id]);
  const result = await pool.query('DELETE FROM countries WHERE id = $1 RETURNING *', [id]);
  return result.rowCount > 0;
};

// Awards
exports.getAwards = async () => {
  const result = await pool.query(`
    SELECT awards.id, awards.name, awards.year, countries.name AS country_name
    FROM awards
    LEFT JOIN countries ON awards.country_id = countries.id
    ORDER BY id DESC
  `);
  return result.rows;
};

exports.checkCountryExists = async (country_id) => {
  const result = await pool.query("SELECT 1 FROM countries WHERE id = $1", [country_id]);
  return result.rowCount > 0;
};

exports.addAward = async (name, year, country_id) => {
  const result = await pool.query(
    "INSERT INTO awards (name, year, country_id) VALUES ($1, $2, $3) RETURNING *",
    [name, year, country_id]
  );
  return result.rows[0];
};

exports.updateAward = async (id, country_id, name, year) => {
  await pool.query(
    "UPDATE awards SET country_id = $1, name = $2, year = $3 WHERE id = $4",
    [country_id, name, year, id]
  );
  return true;
};

exports.deleteAward = async (id) => {
  await pool.query("DELETE FROM movie_award WHERE award_id = $1", [id]);
  await pool.query("DELETE FROM awards WHERE id = $1", [id]);
  return true;
};

// Actors
exports.getActors = async () => {
  const result = await pool.query(`
    SELECT a.id, a.name, a.birthdate, a.url_photos, c.name AS country_name
    FROM actors a
    JOIN countries c ON a.country_id = c.id
  `);
  return result.rows;
};

exports.addActor = async (country_id, name, birth_date, url_photos) => {
  const result = await pool.query(
    'INSERT INTO actors (country_id, name, birthdate, url_photos) VALUES ($1, $2, $3, $4) RETURNING *',
    [country_id, name, birth_date, url_photos]
  );
  return result.rows[0];
};

exports.updateActor = async (id, country_id, name, birth_date, url_photos) => {
  const result = await pool.query(
    'UPDATE actors SET country_id = $1, name = $2, birthdate = $3, url_photos = COALESCE($4, url_photos) WHERE id = $5 RETURNING *',
    [country_id, name, birth_date, url_photos, id]
  );
  return result.rowCount > 0 ? result.rows[0] : null;
};

exports.deleteActor = async (id) => {
  await pool.query("DELETE FROM movie_actor WHERE actor_id = $1", [id]);
  await pool.query('DELETE FROM actors WHERE id = $1', [id]);
  return true;
};
