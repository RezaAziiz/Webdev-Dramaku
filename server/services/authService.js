const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

const client = new OAuth2Client("193966095713-ooq3r03aaanmf67tudroa67ccctfqvk6.apps.googleusercontent.com");

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
    "your_jwt_secret",
    { expiresIn: "1h" }
  );

  return { token, role: user.role_id, banned: user.banned };
};

exports.register = async (username, email, password) => {
  let role;

  if (email.endsWith("@admindramaku.com")) {
    role = "Admin";
  } else if (email.endsWith("@gmail.com")) {
    role = "Writer"; 
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
    audience: "193966095713-ooq3r03aaanmf67tudroa67ccctfqvk6.apps.googleusercontent.com",
  });
  const googleUser = ticket.getPayload();

  let user = await userRepository.findByGoogleId(googleUser.sub);

  if (!user) {
    user = await userRepository.createGoogleUser(googleUser.name, googleUser.email, googleUser.sub);
  }

  if (user.banned) {
    throw new AppError("Account is banned and cannot login.", 403);
  }

  const jwtToken = jwt.sign(
    { username: user.username, role: user.role_id },
    "your_jwt_secret",
    { expiresIn: "1h" }
  );

  return { token: jwtToken, role: user.role_id };
};
