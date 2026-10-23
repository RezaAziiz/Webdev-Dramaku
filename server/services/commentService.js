const commentRepository = require('../repositories/commentRepository');
const AppError = require('../utils/AppError');

const VALID_MEDIA_TYPES = ['movie', 'tv'];

const assertValidMediaType = (mediaType) => {
  if (!VALID_MEDIA_TYPES.includes(mediaType)) {
    throw new AppError("media_type must be 'movie' or 'tv'", 400);
  }
};

exports.addComment = async (userId, tmdbId, mediaType, commentText, rate) => {
  assertValidMediaType(mediaType);
  if (!commentText || !rate) {
    throw new AppError("Comment text and rating are required.", 400);
  }
  return await commentRepository.addComment(userId, tmdbId, mediaType, commentText, rate);
};

exports.getCommentsForTitle = async (tmdbId, mediaType) => {
  assertValidMediaType(mediaType);
  return await commentRepository.getCommentsForTitle(tmdbId, mediaType);
};

exports.deleteComments = async (ids) => {
  await commentRepository.deleteComments(ids);
  return { message: 'Comments deleted successfully' };
};
