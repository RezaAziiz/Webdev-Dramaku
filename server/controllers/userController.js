const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');
const s3Service = require('../services/s3Service');
const AppError = require('../utils/AppError');

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

exports.getPresignedUploadUrl = catchAsync(async (req, res, next) => {
  const { mimeType, size, folder = 'avatars' } = req.body;
  if (!mimeType || !size) {
    return next(new AppError('mimeType and size are required', 400));
  }
  const result = await s3Service.createPresignedUploadUrl({ folder, mimeType, size });
  res.status(200).json(result);
});

exports.updateAvatar = catchAsync(async (req, res, next) => {
  let avatarUrl = req.body?.avatar_url;

  if (req.file) {
    const uploadResult = await s3Service.uploadBuffer({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      folder: 'avatars',
    });
    avatarUrl = uploadResult.publicUrl;
  }

  if (!avatarUrl) {
    return next(new AppError('Photo file or avatar_url is required', 400));
  }

  const result = await userService.updateAvatar(req.user.username, avatarUrl);
  res.status(200).json(result);
});

