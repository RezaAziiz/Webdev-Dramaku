const catchAsync = require('../utils/catchAsync');
const authService = require('../services/authService');

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  res.json(result);
});

exports.register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  const result = await authService.register(username, email, password);
  res.status(201).json(result);
});

exports.googleLogin = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  const result = await authService.googleLogin(token);
  res.json(result);
});
