const catchAsync = require('../utils/catchAsync');
const commentService = require('../services/commentService');

exports.addCommentToMovie = catchAsync(async (req, res, next) => {
  const movieId = parseInt(req.params.id);
  const { commentText, rating, status } = req.body;
  const username = req.user.username; 

  const result = await commentService.addCommentToMovie(movieId, username, commentText, rating, status);
  res.status(201).json(result);
});

exports.getComments = catchAsync(async (req, res, next) => {
  const { searchTerm, shows } = req.query;
  const comments = await commentService.getComments(searchTerm, shows);
  res.json(comments);
});

exports.addGeneralComment = catchAsync(async (req, res, next) => {
  const { username, rate, drama, comments, status } = req.body;
  const newComment = await commentService.addGeneralComment(username, rate, drama, comments, status);
  res.json(newComment);
});

exports.updateCommentStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedComment = await commentService.updateCommentStatus(id, status);
  res.json(updatedComment);
});

exports.deleteComments = catchAsync(async (req, res, next) => {
  const { ids } = req.body;
  await commentService.deleteComments(ids);
  res.sendStatus(200);
});