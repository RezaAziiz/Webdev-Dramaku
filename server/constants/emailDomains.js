// Email domain policy used to auto-assign a role on registration.
// Centralized so the rule is declared once instead of being
// hardcoded inline inside authService.
const EMAIL_DOMAINS = Object.freeze({
  ADMIN: '@admindramaku.com',
  WRITER: '@gmail.com',
});

module.exports = EMAIL_DOMAINS;
