import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CardResult from '../components/cardSearchResult';
import { useNavigate } from 'react-router-dom';

const SearchResult = () => {
  const location = useLocation();
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      const queryParams = new URLSearchParams(location.search);
      const searchTerm = queryParams.get('term'); // Ambil parameter 'term'

      if (searchTerm) {
        try {
          const response = await fetch(`http://localhost:3005/api/search?term=${searchTerm}`);
          const data = await response.json();

          if (response.ok) {
            setMovies(data); // Set data film yang ditemukan
          } else {
            setMovies([]); // Handle hasil kosong
          }
        } catch (error) {
          console.error('Error fetching movies:', error);
        }
      }
    };

    fetchMovies();
  }, [location.search]);

  return (
    <div>
      {/* Modifikasi ukuran main agar sesuai */}
      <main className="p-6 pt-1 max-w-4xl mx-auto">
        <div className="space-y-4"> {/* Ganti grid dengan space-y untuk list-style layout */}
          {movies.length > 0 ? (
            movies.map((movie) => (
              <CardResult key={movie.id} movie={movie}
              onClick={() => navigate(`/movies/${movie.id}`)}
               />
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-full">No movies or actors found matching your search</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchResult;
