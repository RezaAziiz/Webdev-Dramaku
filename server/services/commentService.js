const commentRepository = require('../repositories/commentRepository');
const AppError = require('../utils/AppError');

exports.addCommentToMovie = async (movieId, username, commentText, rating, status) => {
  if (!commentText || !rating) {
    throw new AppError("Comment text and rating are required.", 400);
  }
  await commentRepository.addCommentToMovie(movieId, username, commentText, rating, status);
  return { message: "Comment added successfully." };
};

exports.getComments = async (searchTerm = "", shows = 10) => {
  return await commentRepository.getComments(searchTerm, shows);
};

exports.addGeneralComment = async (username, rate, drama, comments, status) => {
  return await commentRepository.addGeneralComment(username, rate, drama, comments, status);
};

exports.updateCommentStatus = async (id, status) => {
  const comment = await commentRepository.updateCommentStatus(id, status);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  return comment;
};

exports.deleteComments = async (ids) => {
  await commentRepository.deleteComments(ids);
  return { message: 'Comments deleted successfully' };
};