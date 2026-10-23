const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');
const EMAIL_DOMAINS = require('../constants/emailDomains');
const env = require('../config/env');

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

exports.login = async (username, password) => {
  const user = await userRepository.findByUsername(username);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.banned) {
    throw new AppError("Your account has been banned.", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { username: user.username, role: user.role_id, banned: user.banned },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return { token, role: user.role_id, banned: user.banned };
};

exports.register = async (username, email, password) => {
  let role;

  if (email.endsWith(EMAIL_DOMAINS.ADMIN)) {
    role = ROLES.ADMIN;
  } else if (email.endsWith(EMAIL_DOMAINS.WRITER)) {
    role = ROLES.WRITER;
  } else {
    throw new AppError("Invalid email domain", 400);
  }

  const existingUser = await userRepository.findByUsername(username);
  if (existingUser) {
    throw new AppError("Username already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userRepository.createUser(username, email, hashedPassword, role);

  return { message: "User registered successfully", role };
};

exports.googleLogin = async (googleToken) => {
  const ticket = await client.verifyIdToken({
    idToken: googleToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const googleUser = ticket.getPayload();

  let user = await userRepository.findByGoogleId(googleUser.sub);

  if (!user) {
    user = await userRepository.createGoogleUser(googleUser.name, googleUser.email, googleUser.sub, ROLES.WRITER);
  }

  if (user.banned) {
    throw new AppError("Account is banned and cannot login.", 403);
  }

  const jwtToken = jwt.sign(
    { username: user.username, role: user.role_id },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return { token: jwtToken, role: user.role_id };
};
