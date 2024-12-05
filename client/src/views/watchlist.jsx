import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardMovie from '../components/cardMovie';

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            setUsername(decodedToken.username);
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (isLoggedIn && username) {
            const fetchWatchlist = async () => {
                try {
                    const response = await fetch(`http://localhost:3005/api/watchlist/${username}`);
                    if (!response.ok) {
                        const errorData = await response.text();
                        console.error('Error fetching watchlist:', errorData);
                        return;
                    }
                    const contentType = response.headers.get('Content-Type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        setWatchlist(data);
                    } else {
                        console.error('Expected JSON, but received:', contentType);
                    }
                } catch (error) {
                    console.error('Error fetching watchlist:', error);
                }
            };
            fetchWatchlist();
        }
    }, [isLoggedIn, username]);

    const removeFromWatchlist = async (movieId) => {
        try {
            const response = await fetch(`http://localhost:3005/api/watchlist/${username}/${movieId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setWatchlist(watchlist.filter(movie => movie.id !== movieId));
            } else {
                console.error('Failed to remove movie from watchlist');
            }
        } catch (error) {
            console.error('Error removing movie from watchlist:', error);
        }
    };

    return (
        <div className="bg-gray-800 min-h-screen text-white p-6">
            <h1 className="text-3xl font-semibold mb-6">Your Watchlist</h1>
            {watchlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watchlist.map((movie) => (
                        <div key={movie.id} className="relative">
                            <CardMovie
                                poster={movie.images || 'https://via.placeholder.com/200x300?text=No+Image+Available'}
                                title={movie.title}
                                year={movie.year}
                                genre={movie.genre}
                                rating={movie.rating ? Number(movie.rating).toFixed(1) || '0.0' : 'N/A'}
                                onClick={() => navigate(`/movies/${movie.id}`)}
                            />
                            <button
                                onClick={() => removeFromWatchlist(movie.id)}
                                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">You have no movies in your watchlist.</p>
            )}
        </div>
    );
};

export default Watchlist;
