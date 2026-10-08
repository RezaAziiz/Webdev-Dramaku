const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userService.getAllUsers();
  res.json(users);
});

exports.banUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const result = await userService.banUser(username);
  res.status(200).json(result);
});

exports.updateRole = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const { role } = req.body;
  const result = await userService.updateRole(username, role);
  res.status(200).json(result);
});
