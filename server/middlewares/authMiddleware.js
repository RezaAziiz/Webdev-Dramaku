const jwt = require("jsonwebtoken");
const AppError = require('../utils/AppError');
const env = require('../config/env');

exports.authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  jwt.verify(token, env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new AppError('Invalid token or token has expired.', 403));
    }
    req.user = user;
    next();
  });
};
