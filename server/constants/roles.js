// Mirrors client/src/constants/auth.js USER_ROLES.
// Centralized here so role strings are never hardcoded inline
// and are only ever compared/assigned via this object.
const ROLES = Object.freeze({
  ADMIN: 'Admin',
  WRITER: 'Writer',
});

module.exports = ROLES;
