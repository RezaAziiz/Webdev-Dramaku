const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

exports.getAllUsers = async () => {
  return await userRepository.getAllActiveUsers();
};

exports.banUser = async (username) => {
  const user = await userRepository.banUser(username);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return { message: 'User banned successfully' };
};

exports.updateRole = async (username, role) => {
  const user = await userRepository.updateRole(username, role);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return { message: 'User role updated successfully' };
};

exports.updateAvatar = async (username, avatarUrl) => {
  const user = await userRepository.updateAvatar(username, avatarUrl);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return { message: 'Avatar updated successfully', avatar_url: user.avatar_url };
};
