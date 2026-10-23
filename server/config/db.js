const { Pool } = require('pg');

// Local Postgres installs typically don't support/require SSL, while hosted
// providers (e.g. Railway) require it. Make this configurable instead of
// hardcoding one behavior for both environments.
const LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const sslMode = process.env.PGSSLMODE; // 'disable' | 'require' | undefined
const isLocalHost = LOCAL_HOSTS.includes(process.env.PGHOST);
const useSSL = sslMode ? sslMode !== 'disable' : !isLocalHost;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => console.log('Database connected successfully (config/db.js)'))
  .catch((err) => console.error('Database connection error', err.stack));

module.exports = pool;
