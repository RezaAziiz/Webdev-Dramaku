const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');
const AppError = require('../utils/AppError');
const cloudinary = require('../config/cloudinary');

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

exports.updateAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Photo is required', 400));
  }

  const avatarUrl = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: 'avatars' }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    uploadStream.end(req.file.buffer);
  });

  const result = await userService.updateAvatar(req.user.username, avatarUrl);
  res.status(200).json(result);
});
