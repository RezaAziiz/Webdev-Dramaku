const catchAsync = require('../utils/catchAsync');
const commentService = require('../services/commentService');

exports.addComment = catchAsync(async (req, res, next) => {
  const { tmdbId, mediaType, commentText, rate } = req.body;
  const comment = await commentService.addComment(req.user.id, tmdbId, mediaType, commentText, rate);
  res.status(201).json(comment);
});

exports.getCommentsForTitle = catchAsync(async (req, res, next) => {
  const { tmdbId, mediaType } = req.params;
  const comments = await commentService.getCommentsForTitle(parseInt(tmdbId), mediaType);
  res.json(comments);
});

exports.deleteComments = catchAsync(async (req, res, next) => {
  const { ids } = req.body;
  const result = await commentService.deleteComments(ids);
  res.json(result);
});
