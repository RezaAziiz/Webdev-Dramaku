import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';


const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [suggestions, setSuggestions] = useState([]);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]); // eslint-disable-line no-unused-vars
  const [awards, setAwards] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const years = Array.from({ length: 40 }, (_, index) => 1985 + index);
  const [actors, setActors] = useState([]);
  const [filter, setFilter] = useState({
    genre: '',
    country: '',
    year: '',
    avail: '',
    award: '',
    sort: '',
  });



  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  const applyFilter = () => {
    const filteredMovies = movies.filter((movie) => {
      const filterCountryId = parseInt(filter.country, 10);
      const matchesCountry = filter.country ? movie.country_id === filterCountryId : true;
      const matchesGenre = filter.genre
        ? movie.genre.split(', ').includes(filter.genre)
        : true;// Menggunakan name untuk genre
      const matchesYear = filter.year ? movie.year === parseInt(filter.year) : true;
      const matchesAvail = filter.avail
        ? normalizeAvailability(movie.availability) === normalizeAvailability(filter.avail)
        : true;
      const matchesAward = filter.award
        ? movie.award === filter.award
        : true;

      console.log(filter.award)
      console.log(movie.award)
      // console.log(matchesAward)

      return matchesCountry && matchesGenre && matchesYear && matchesAvail && matchesAward;
    });


    // Sorting the filtered movies based on the selected sort option
    if (filter.sort === "A-Z") {
      filteredMovies.sort((a, b) => a.title.localeCompare(b.title)); // Ascending
    } else if (filter.sort === "Z-A") {
      filteredMovies.sort((a, b) => b.title.localeCompare(a.title)); // Descending
    }

    // console.log('Filtered Movies:', filteredMovies);
    navigate('/filtered-movies', { state: { filteredMovies, filter } });
    setIsDropdownVisible(false);
  };

  const normalizeAvailability = (availability) => {
    switch (availability.toLowerCase()) {
      case 'amazon':
      case 'amazon prime':
      case 'amazon prime video':
      case 'amazon us':
      case 'amazon video':
        return 'Amazon Prime Video';
      case 'apple tv':
      case 'apple tv ':
      case 'apple tv+':
      case 'apple tv +':
        return 'Apple TV';
      case 'crunchyroll':
      case 'cruncyroll':
        return 'Crunchyroll';
      case 'disney +':
      case 'disney+':
        return 'Disney+';
      case 'google play film':
      case 'google play movies':
        return 'Google Play Movies';
      case 'netflix':
      case 'netiflix':
        return 'Netflix';
      case 'prime video':
      case 'primevideo':
        return 'Prime Video';
      case 'youtube':
      case 'youtube ani one':
        return 'YouTube';
      default:
        return availability;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT to extract username
      setUsername(payload.username);
      setIsAuthenticated(true);
    }
  }, []);


  useEffect(() => {
    if (movies.length > 0) {
      const distinctAvailabilities = getDistinctAvailabilities();
      setAvailabilities(distinctAvailabilities);
    }
  }, [movies]);


  const getDistinctAvailabilities = () => {
    // Gabungkan semua availabilities ke dalam satu array
    const availabilities = movies.flatMap(movie =>
      movie.availability
        ? movie.availability.split(/,/).map(item => item.trim())
        : []
    );

    // Normalisasi nama yang mirip agar menjadi satu nama standar
    const normalizeAvailability = (availability) => {
      switch (availability.toLowerCase()) {
        case 'amazon':
        case 'amazon prime':
        case 'amazon prime video':
        case 'amazon us':
        case 'amazon video':
          return 'Amazon Prime Video';
        case 'apple tv':
        case 'apple tv ':
        case 'apple tv+':
        case 'apple tv +':
          return 'Apple TV';
        case 'crunchyroll':
        case 'cruncyroll':
          return 'Crunchyroll';
        case 'disney +':
        case 'disney+':
          return 'Disney+';
        case 'google play film':
        case 'google play movies':
          return 'Google Play Movies';
        case 'netflix':
        case 'netiflix':
          return 'Netflix';
        case 'prime video':
        case 'primevideo':
          return 'Prime Video';
        case 'youtube':
        case 'youtube ani one':
          return 'YouTube';
        default:
          return availability;
      }
    };

    // Gunakan normalisasi dan dapatkan nilai unik
    const uniqueAvailabilities = [...new Set(availabilities.map(normalizeAvailability))];

    // Filter out any unwanted values
    const filteredAvailabilities = uniqueAvailabilities.filter(availability => {
      // Remove unwanted values such as "NaN" and any entries containing multiple services
      return availability && !availability.includes('Microsoft Store Google Play Movies') && availability !== 'NaN';
    });

    // Sort alphabetically
    filteredAvailabilities.sort((a, b) => a.localeCompare(b));

    return filteredAvailabilities;
  };


  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    queryParams.append('term', searchTerm);
    setSuggestions([]);
    navigate(`/search?${queryParams.toString()}`);
  };

  const handleMovieClick = (suggestion) => {
    setSearchTerm(''); // Clear the search term
    setSuggestions([]); // Close the suggestions dropdown
    navigate(`/movies/${suggestion.id}`); // Redirect to the movie detail page with the movie ID
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsProfileDropdownVisible(false);
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT to extract username
      setUsername(payload.username);
      setUserRole(payload.role);
      setIsAuthenticated(true);
    }
  }, []); // Empty dependency array ensures this runs only once after the component mounts


  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch('http://localhost:3005/movies');
      const data = await response.json();

      if (data.length > 0) {
        setMovies(data); // Store all movies
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchActors = async () => {
    try {
      const response = await fetch('http://localhost:3005/actors');
      const data = await response.json();
      setActors(data);
    } catch (error) {
      console.error('Error fetching actors:', error);
    }
  };

  const fetchSuggestions = async (input) => {
    if (input.length < 2) {
      setSuggestions([]); // Clear suggestions if input is too short
      return;
    }

    input = input.toLowerCase();

    // First, try searching in the movies
    const movieResults = movies.filter((movie) =>
      movie.title.toLowerCase().startsWith(input)
    );

    // If no movies found, search in the actors
    let results = movieResults;

    // if (movieResults.length === 0) {
    //     const actorResults = actors.filter((actor) => 
    //         actor.name.toLowerCase().startsWith(input)
    //     );
    //     results = actorResults; // Update results with actors if no movies were found
    // }

    setSuggestions(results); // Set the final results
  };


  const fetchGenres = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/genres');
      const data = await response.json();
      setGenres(data); // Menyimpan data genre ke state
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };


  const fetchAwards = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/awards');
      const data = await response.json();
      setAwards(data);
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  };

  useEffect(() => {
    if (location.pathname === '/') {
      setSearchTerm('');
      setSuggestions([]);
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchActors();
    fetchMovies();
    fetchGenres();
    fetchCountries();
    fetchAwards();
    const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);
    debouncedFetchSuggestions(searchTerm);
  }, [searchTerm]);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownVisible(!isProfileDropdownVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const filterButton = document.getElementById('filterButton');
      const filterDropdown = document.getElementById('filterDropdown');
      const profileDropdown = document.getElementById('profileDropdown');
      const profileButton = document.getElementById('profileButton');

      if (
        filterDropdown &&
        !filterDropdown.contains(event.target) &&
        filterButton &&
        !filterButton.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }

      if (
        profileDropdown &&
        !profileDropdown.contains(event.target) &&
        profileButton &&
        !profileButton.contains(event.target)
      ) {
        setIsProfileDropdownVisible(false);
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUsername(''); // Reset username
    navigate('/');
  };


  {/* Clear Filter Function */ }
  const clearFilter = () => {
    setFilter({
      genre: '',
      country: '',
      year: '',
      avail: '',
      sort: '',
      award: '',
    });
  };

  return (
    <nav className="flex justify-between items-center bg-gray-900 p-4">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src={logo}
          className="w-40 h-10 mr-2 cursor-pointer"
          alt="Logo"
          onClick={handleLogoClick}
        />
      </div>

      {/* Search and Filter */}
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-96  p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div
            className="absolute top-full mt-2 w-96 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto"
          >
            {/* Sort the suggestions by title in ascending order */}
            {suggestions
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleMovieClick(suggestion)} // Pass the entire suggestion object
                >
                  {suggestion.title}
                </div>
              ))}
          </div>
        )}

        <button
          id="filterButton"
          onClick={toggleDropdown}
          className="ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full relative"
        >
          Filter
        </button>

        {/* Dropdown Menu for Filters */}
        <div
          id="filterDropdown"
          className={`absolute right-0 mt-2 bg-gray-700 rounded-lg shadow-lg z-10 ${isDropdownVisible ? '' : 'hidden'}`}
          style={{ width: '750px', transform: 'translateX(20%)', top: '100%', right: '0' }} // Customize the width here
        >
          <div className="p-4">
            <div className="flex justify-between items-center"> {/* Flex untuk menyelaraskan item */}
              <h4 className="text-lg font-semibold text-white">Filter by:</h4>
              <div>
                <button
                  onClick={applyFilter}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 mr-2"
                >
                  Apply Filter
                </button>
                <button
                  onClick={clearFilter}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 mt-4">

              {/* Genre Filter */}
              <div className="col-span-4">
                <label className="block text-white">Genre</label>
                <select
                  className="w-full p-2 bg-gray-900 rounded"
                  value={filter.genre}
                  name="genre"
                  onChange={handleFilterChange}
                >
                  <option value="">All Genres</option> {/* Default empty value */}
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.name}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div className="col-span-4">
                <label className="block text-white">Country</label>
                <select
                  className="w-full p-2 bg-gray-900 rounded"
                  value={filter.country}
                  name="country"
                  onChange={handleFilterChange}
                >
                  <option value="">All Countries</option> {/* Default empty value */}
                  <option value="1">South Korea</option>
                  <option value="2">United States</option>
                  <option value="3">Indonesia</option>
                  <option value="4">Japan</option>
                  <option value="5">England</option>
                  <option value="6">Malaysia</option>
                  <option value="7">China</option>
                  <option value="8">India</option>
                  <option value="9">Spain</option>
                  <option value="10">Thailand</option>
                </select>
              </div>

              {/* Year Filter */}
              <div className="col-span-4">
                <label className="block text-white">Year</label>
                <select
                  className="w-full p-2 bg-gray-900 rounded"
                  value={filter.year}
                  name="year"
                  onChange={handleFilterChange}
                >
                  <option value="">All Years</option> {/* Default empty value */}
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div className="col-span-6">
                <label className="block text-white">Availability</label>
                <select
                  className="w-full p-2 bg-gray-900 rounded"
                  value={filter.avail}
                  name="avail"
                  onChange={handleFilterChange}
                >
                  <option value="">All Availability</option> {/* Default empty value */}
                  {availabilities.map((availability, index) => (
                    <option key={index} value={availability}>
                      {availability}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Alphabetically Filter */}
              <div className="col-span-6">
                <label className="block text-white">Sort Alphabetically Title</label>
                <select
                  className="w-full p-2 bg-gray-900 rounded"
                  value={filter.sort} // Assuming filter.sort is the state for sort option
                  name="sort"
                  onChange={handleFilterChange}
                >
                  <option value="">No Sorting</option> {/* Default empty value */}
                  <option value="A-Z">A-Z</option>
                  <option value="Z-A">Z-A</option>
                </select>
              </div>

              {/* Award Filter */}
              <div className="col-span-12">
                <label className="block text-white">Award</label>
                <select
                  className="w-full p-2 bg-gray-900 rounded"
                  value={filter.award}
                  onChange={(e) => setFilter({ ...filter, award: e.target.value })}
                >
                  <option value="">All Awards</option> {/* Default empty value */}
                  {awards.map((award) => (
                    <option key={award.id} value={`${award.name} (${award.year})`}>
                      {`${award.name} (${award.year})`}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Watchlist and Profile with Dropdown */}
      <div className="flex items-center">

        <a
          href={isAuthenticated ? `/watchlist/${username}` : "/login"}
          className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-full flex items-center mr-2"
        >
          <i className="fas fa-bookmark mr-2"></i> Watchlist
        </a>

        {!isAuthenticated ? (
          <a
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-full"
          >
            Login
          </a>
        ) : (
          <div className="relative">
            <div
              id="profileButton"
              onClick={toggleProfileDropdown}
              className="bg-blue-300 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer"
            >
              {username ? username.charAt(0).toUpperCase() : ''}
            </div>
            {isProfileDropdownVisible && (
              <div
                id="profileDropdown"
                className="absolute right-0 mt-2 bg-gray-700 rounded-lg shadow-lg z-10"
                style={{ top: '100%', right: '0' }}
              >
                {/* Conditionally render based on role */}
                {userRole === 'Admin' && (
                  <button
                    onClick={() => handleNavigation('/dramaInput')}
                    className="block w-full px-4 py-2 text-white hover:bg-gray-800 text-left"
                  >
                    CMSAdmin
                  </button>
                )}

                {userRole === 'Writer' && (
                  <button
                    onClick={() => handleNavigation('/dramaInput')}  // Adjust the route as needed
                    className="block w-full px-4 py-2 text-white hover:bg-gray-800 text-left"
                  >
                    CMSWriter
                  </button>
                )}

                {/* Logout option */}
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-white hover:bg-gray-800 text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}


      </div>

    </nav>
  );
};

export default Navbar;
