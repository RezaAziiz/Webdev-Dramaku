import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CardMovie from "../components/cardMovie";
import { getWatchlist, removeFromWatchlist } from "../services/watchlistService";
import { getMovieDetails } from "../services/movieService";
import { TMDB_POSTER_SIZE, tmdbImageUrl } from "../lib/media";
import { httpClient } from "../services/httpClient";
import "../styles/profile.css";


const UserProfile = () => {
  const { username } = useParams();

  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [comments, setComments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || "");

  useEffect(() => {
    if (username && token) {
      fetchUserData();
    }
  }, [username, token]);

  const fetchUserData = async () => {
    try {
      // Fetch Watchlist
      const entries = await getWatchlist(token);
      const items = await Promise.all(
        (entries || []).map(async (entry) => {
          const details = await getMovieDetails(entry.media_type, entry.tmdb_id);
          return {
            tmdbId: entry.tmdb_id,
            mediaType: entry.media_type,
            title: details?.title || details?.name || "Unknown",
            poster: details?.poster_path ? tmdbImageUrl(details.poster_path, TMDB_POSTER_SIZE) : "",
            rating: details?.vote_average,
          };
        })
      );
      setWatchlist(items);

      // Placeholder for fetching user comments
      setComments([
        { id: 1, movieTitle: "The Godfather", comment: "Masterpiece!", date: "2023-10-01" },
        { id: 2, movieTitle: "Inception", comment: "Mind-bending experience.", date: "2023-10-05" },
      ]);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const result = await httpClient.put("/api/users/me/avatar", formData, {
        token,
        isFormData: true,
      });
      if (result?.avatar_url) {
        setProfilePhoto(result.avatar_url);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    }
  };


  return (
    <div className="user-profile-page">
      <header className="profile-hero">
        <div className="profile-avatar-container">
          <img 
            src={profilePhoto || `https://ui-avatars.com/api/?name=${username}&background=random`} 
            alt="Profile" 
            className="profile-avatar"
          />
          {isEditing && (
            <label className="avatar-upload-btn">
              <input type="file" onChange={handlePhotoUpload} accept="image/*" />
              <span>Change Photo</span>
            </label>
          )}
        </div>
        <h1 className="profile-name">{username}</h1>
        <button 
          className="edit-profile-btn" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>
      </header>

      <section className="profile-section">
        <h2 className="section-title">My Watchlist</h2>
        <div className="watchlist-grid">
          {watchlist.length > 0 ? (
            watchlist.map((item) => (
              <div key={`${item.mediaType}-${item.tmdbId}`} className="watchlist-item">
                <CardMovie
                  poster={item.poster}
                  title={item.title}
                  rating={item.rating?.toFixed(1)}
                  onClick={() => navigate(`/movies/${item.mediaType}/${item.tmdbId}`)}
                />
              </div>
            ))
          ) : (
            <p className="empty-text">Your watchlist is empty.</p>
          )}
        </div>
      </section>

      <section className="profile-section">
        <h2 className="section-title">My Comments</h2>
        <div className="comments-list">
          {comments.map((c) => (
            <div key={c.id} className="comment-card">
              <div className="comment-header">
                <strong>{c.movieTitle}</strong>
                <span>{c.date}</span>
              </div>
              <p>{c.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserProfile;
