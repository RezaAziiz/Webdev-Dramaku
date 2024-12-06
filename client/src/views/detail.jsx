import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CommentList from '../components/comment'
import { useNavigate } from 'react-router-dom';



const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filterRating, setFilterRating] = useState(0);
  const [username, setUsername] = useState('');
  const [genreColors, setGenreColors] = useState({});
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  // const [loggedInUsername, setLoggedInUsername] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/genres');
        const genres = await response.json();

        const colors = generateGenreColors(genres);
        setGenreColors(colors);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);


  const generateGenreColors = (genres) => {
    const colors = {};

    const colorPalette = [
      '#f87171', '#fbbf24', '#34d399', '#ec4899', '#60a5fa', '#f43f5e', '#a855f7', '#10b900', '#4338ca', '#fb923c',
      '#e879f9', '#a3e635', '#2563eb', '#9ca3af', '#fca5a5', '#fde047', '#4ade80', '#f9a8d4', '#93c5fd', '#f8719d',
      '#8b5cf6', '#bbf7d0', '#4f46e5', '#fdba74', '#e0aaff', '#bef264', '#7dd3fc', '#d4e100', '#166534', '#65a30d',
      '#fbcfe8', '#f97316', '#fde68a', '#0ea5e9', '#9aa800', '#22c55e', '#c084fc', '#14532d', '#2dd4bf', '#d1fae5',
      '#d946ef', '#0284c7', '#a3e635', '#6366f1', '#059669', '#facc15', '#b91c1c', '#4c1d95', '#dc2626', '#1d4ed8'
    ];

    genres.forEach((genre, index) => {
      colors[genre.name.toLowerCase()] = colorPalette[index % colorPalette.length];
    });

    return colors;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT
      setUsername(decodedToken.username); // Ambil username dari JWT
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const checkWatchlist = async () => {
      if (isLoggedIn && username) {
        try {
          const response = await fetch(`http://localhost:3005/api/watchlist/${username}`);
          const watchlist = await response.json();
          setIsInWatchlist(watchlist.some(item => item.id === movie.id));
        } catch (error) {
          console.error('Error checking watchlist:', error);
        }
      }
    };

    if (movie) {
      checkWatchlist();
    }
  }, [movie, isLoggedIn, username]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3005/movies/${id}`);
        if (!response.ok) {
          throw new Error(`Error fetching movie details: ${response.statusText}`);
        }
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (!movie) return <div>Loading...</div>;

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = extractYouTubeId(movie.trailer);

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || rating === 0) {
      alert("Please provide a comment and a rating.");
      return; // Don't proceed if comment or rating is invalid
    }
  
    // Log the values that will be sent to the backend
    console.log("Comment Text:", commentText);
    console.log("Rating:", rating);
  
    try {
      const response = await axios.post(
        `http://localhost:3005/movies/${id}/comments`,
        { commentText, rating },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Get token from localStorage
          },
        }
      );
  
      // You can log the response after it's successfully posted
      console.log("Response from backend:", response.data);
  
      // Update the movie state with the new comment
      setCommentText(''); // Clear input after submit
      setRating(0); // Reset rating
      setIsCommentFormVisible(false); // Hide the form after submit
      setMovie(prevMovie => ({
        ...prevMovie,
        comments: [
          ...(prevMovie.comments || []),
          { userName: username, text: commentText, rating, createdAt: new Date().toISOString() }
        ]
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment."); // Show alert if failed
    }
  };
  

  const handleAddToWatchlist = async (movieId) => {
    if (!isLoggedIn) {
      return navigate('/login');
    }

    if (!username) {
      alert('Username is not defined.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3005/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, movieId: movieId }),
      });

      if (response.ok) {
        setIsInWatchlist(true); // Update the state after adding to watchlist
        alert('Movie added to your watchlist.');
      } else {
        alert('Failed to add movie to watchlist.');
      }
    } catch (error) {
      console.error('Error adding movie to watchlist:', error);
      alert('Failed to add movie to watchlist.');
    }
  };


  const filteredComments = filterRating
    ? movie.comments.filter(comment => comment.rating === filterRating)
    : movie.comments;

  // const showComments = movie.comments.filter(comment => comment.status);

  return (
    <div>
      <main className="p-8 max-w-5xl mx-auto">
        {movie ? (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-none w-full md:w-1/5">
              <img
                src={movie.images || 'https://via.placeholder.com/200x300?text=No+Image+Available'}
                alt={`${movie.title || 'Movie'} Poster`}
                className="w-full h-72 rounded shadow-lg mb-4"
              />
              <button
                onClick={() => handleAddToWatchlist(movie.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded shadow"
              >
                {isInWatchlist ? 'In Your Watchlist' : '+ Add to My Watchlist'}
              </button>
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl text-gray-200 font-bold mb-2">{movie.title || 'Title Not Available'}</h1>
              <p className="text-sm text-gray-200 mb-2">
                <strong>Alternative Titles:</strong> {movie.alt_title === "NaN" ? "-" : (movie.alt_title || 'N/A')}
              </p>
              {/* Year and Country */}
              <div className="flex items-center gap-2 mb-3">
                {/* Year */}
                {movie.year ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-black bg-white">
                    {movie.year}
                  </span>
                ) : (
                  <span className="text-sm text-gray-200">Year: Unknown</span>
                )}

                {/* Country */}
                {movie.country_name ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-black bg-white">
                    {movie.country_name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-200">Country: Unknown</span>
                )}
              </div>
              <p className="text-sm text-gray-200 mb-4">{movie.synopsis || 'No synopsis available'}</p>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-3">
                {movie.genres ? (
                  movie.genres.split(',').map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-medium text-black"
                      style={{
                        backgroundColor: genreColors[genre.trim().toLowerCase()] || '#9ca3af',
                      }}
                    >
                      {genre.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-200">No genres available</span>
                )}
              </div>

              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-yellow-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .587l3.668 7.568 8.332 1.213-6.016 5.885 1.418 8.288L12 18.897l-7.402 3.888 1.418-8.288L.584 9.368l8.332-1.213z" />
                </svg>
                <p className="text-sm text-gray-200">Rating: {movie.rating ? Number(movie.rating).toFixed(1) : 'N/A'}</p>
              </div>
              <p className="text-sm text-gray-200 mb-2">
                <strong>Availability:</strong> {movie.availability || 'Unknown'}
              </p>
              <p className="text-sm text-gray-200 mb-4"><strong>Awards:</strong> {movie.awards || 'No Awards'}</p>
            </div>
          </div>
        ) : (
          <div>No movie data available</div>
        )}

        {/* Stars Section */}
        <div className="my-8 text-center">
          <h2 className="text-2xl text-gray-200 font-bold mb-4">Stars</h2>
          <div className="flex justify-center space-x-7 flex-wrap">
            {movie.actors && movie.actors.length > 0 ? (
              [...movie.actors]
                .sort((a, b) => (a.url_photos ? -1 : 1)) // Sort: prioritize actors with URLs
                .slice(0, 9)
                .map((actor, index) => (
                  <div key={index} className="flex flex-col items-center flex-shrink-0">
                    <img
                      src={actor.url_photos || 'https://via.placeholder.com/100'}
                      alt={actor.name}
                      className="w-20 h-20 bg-gray-700 rounded-full mb-2 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100';
                      }}
                    />
                    <p className="text-gray-200 whitespace-normal break-words text-center max-w-[70px] text-xs">
                      {actor.name && typeof actor.name === 'string' && actor.name.split(' ').length > 3
                        ? actor.name.split(' ').map((word, i) => (
                          <span key={i}>
                            {word}
                            <br />
                          </span>
                        ))
                        : actor.name || "No name available"}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-gray-400">No actors available</p>
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="bg-gray-800 rounded mb-8 p-10">
          <div className="flex items-center justify-center">
            {videoId ? (
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded shadow-lg"
              ></iframe>
            ) : (
              <p>No trailer available</p>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-800 p-4 rounded mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">People think about this movie</h2>
            {isLoggedIn ? (
              <button
                onClick={() => setIsCommentFormVisible(!isCommentFormVisible)}
                className="bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition duration-300"
              >
                Add Comment
              </button>
            ) : (
              <p className="text-gray-400">Please log in to add a comment.</p>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-white">({movie.comments ? movie.comments.length : 0}) Comments</p>
            <div className="flex items-center">
              <span className="text-white mr-2">Filter by:</span>
              <select
                className="bg-gray-700 text-white p-2 rounded"
                onChange={(e) => setFilterRating(Number(e.target.value))}
                defaultValue={filterRating}
              >
                <option value="0" className="text-white">All ratings</option>
                <option value="5" className="text-yellow-500">★★★★★</option>
                <option value="4" className="text-yellow-500">★★★★☆</option>
                <option value="3" className="text-yellow-500">★★★☆☆</option>
                <option value="2" className="text-yellow-500">★★☆☆☆</option>
                <option value="1" className="text-yellow-500">★☆☆☆☆</option>
              </select>
            </div>
          </div>

          {isCommentFormVisible && (
            <div className="mb-4">
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${rating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                    onClick={() => setRating(star)}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.571 8.332 1.215-6.0 5.874 1.417 8.239L12 18.897l-7.417 3.9 1.417-8.239-6.0-5.874 8.332-1.215z" />
                  </svg>
                ))}
              </div>

              <textarea
                rows="3"
                placeholder="Write your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-2 text-white rounded bg-gray-600 focus:outline-none resize-none"
              />

              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={handleCommentSubmit}
                  className="bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition duration-300"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Use CommentList to display comments */}
          <CommentList comments={filteredComments} />
        </div>

      </main >
    </div >
  );
};

export default MovieDetail;

