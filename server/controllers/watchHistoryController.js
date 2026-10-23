const catchAsync = require('../utils/catchAsync');
const watchHistoryService = require('../services/watchHistoryService');

// Intended to be called from the frontend's vidrock/moviesapi postMessage
// listener (on 'pause' / 'seeked' / 'ended' / periodic 'timeupdate') so
// progress is persisted server-side for cross-device "Continue Watching".
exports.saveProgress = catchAsync(async (req, res, next) => {
  const { tmdbId, mediaType, season, episode, watchedSeconds, durationSeconds } = req.body;
  const entry = await watchHistoryService.saveProgress(req.user.id, {
    tmdbId,
    mediaType,
    season,
    episode,
    watchedSeconds,
    durationSeconds,
  });
  res.status(200).json(entry);
});

exports.getContinueWatching = catchAsync(async (req, res, next) => {
  const history = await watchHistoryService.getContinueWatching(req.user.id);
  res.json(history);
});

exports.removeEntry = catchAsync(async (req, res, next) => {
  const { mediaType, tmdbId } = req.params;
  const { season, episode } = req.query;
  await watchHistoryService.removeEntry(
    req.user.id,
    parseInt(tmdbId),
    mediaType,
    season ? parseInt(season) : null,
    episode ? parseInt(episode) : null
  );
  res.status(200).json({ message: 'Removed from watch history' });
});
