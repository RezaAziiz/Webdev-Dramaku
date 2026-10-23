// Centralized environment variable access.
// Secrets and other environment-specific values must be read from here,
// never hardcoded inline in services/middlewares.
const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in your .env file (local) or in your hosting provider's environment settings (production).`
    );
  }
  return value;
};

module.exports = {
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  GOOGLE_CLIENT_ID: requireEnv('GOOGLE_CLIENT_ID'),
};
