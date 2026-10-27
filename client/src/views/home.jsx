import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "../components/slider";
import { useAuth } from "../contexts/AuthContext";
import { normalizeGenre } from "../adapters/mediaAdapter";
import { addToWatchlist } from "../services/watchlistService";
import { useGenreCatalog } from "../hooks/useGenreCatalog";
import { useTrendingFeed } from "../hooks/useTrendingFeed";
import { useJustAddedFeed } from "../hooks/useJustAddedFeed";
import TrendingSection from "../components/sections/TrendingSection";
import JustAddedSection from "../components/sections/JustAddedSection";
import ContinueWatchingSection from "../components/sections/ContinueWatchingSection";
import AnimeSection from "../components/sections/AnimeSection";
import BrowseByGenreSection from "../components/sections/BrowseByGenreSection";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const { genres: genreItems } = useGenreCatalog();
  const { items: trendingItems } = useTrendingFeed();
  const { items: justAddedItems } = useJustAddedFeed();

  const normalizedGenres = useMemo(
    () => genreItems.map(normalizeGenre).filter((genre) => genre !== null),
    [genreItems],
  );

  const representativeItems = useMemo(
    () => [...trendingItems, ...justAddedItems],
    [trendingItems, justAddedItems],
  );

  const [mediaFilter, setMediaFilter] = useState("All");

  const onOpen = (path) => navigate(path);
  const onSave = (tmdbId, mediaType, authToken) =>
    addToWatchlist(tmdbId, mediaType, authToken);
  const onGenreViewAll = (genre, browseType) => {
    const type = browseType === "TV Show" ? "tv" : "movie";
    navigate(`/search?type=${type}&genre=${encodeURIComponent(genre.name)}`);
  };

  return (
    <div className="media-page-shell">
      <Slider />
      <TrendingSection
        token={token}
        isAuthenticated={isAuthenticated}
        onOpen={onOpen}
        onSave={onSave}
      />
      {isAuthenticated && (
        <ContinueWatchingSection token={token} />
      )}
      <JustAddedSection
        mediaFilter={mediaFilter}
        setMediaFilter={setMediaFilter}
      />
      <AnimeSection genres={normalizedGenres} />
      <BrowseByGenreSection
        genres={normalizedGenres}
        representativeItems={representativeItems}
        onGenreViewAll={onGenreViewAll}
      />
    </div>
  );
};

export default Home;
