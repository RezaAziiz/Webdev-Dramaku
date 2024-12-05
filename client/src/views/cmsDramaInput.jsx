import React, { useState, useEffect } from 'react';
import Cms from '../components/cms';
import { useNavigate, useLocation } from 'react-router-dom';

const DramaInput = () => {
    //   const [image, setImage] = useState(null);
    const [setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedActors, setSelectedActors] = useState([]);
    const [newActorName, setNewActorName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [movies, setMovies] = useState([]);
    const [countries, setCountries] = useState([]);
    const [awards, setAwards] = useState([]);
    const navigate = useNavigate();
    const years = Array.from({ length: 40 }, (_, index) => 1985 + index);
    const [movie, setMovie] = useState({
        title: '',
        altTitle: '',
        year: '',
        country: '',
        availability: '',
        synopsis: '',
        genres: [],
        actors: [],
        trailer: '',
        award: [],
    });


    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log('Movie:', movie);

        try {
            const response = await fetch('http://localhost:3005/api/movies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: movie.title,
                    alt_title: movie.altTitle,
                    year: movie.year,
                    // country_id: movie.country,
                    availability: movie.availability,
                    synopsis: movie.synopsis,
                    trailer: movie.trailer,
                }), 
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Movie posted successfully:', data);
                // empty form after submit
                setMovie({
                    title: '',
                    altTitle: '',
                    country: '',
                    availability: '',
                    synopsis: '',
                    trailer: '',
                    year: '',
                  });
                
                  window.alert(`Drama ${movie.title} has been successfully created.`);
            } else {
                console.error('Failed to post movie:', response.statusText);
            }
        } catch (error) {
            console.error('Error posting movie:', error);
        }
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


    const fetchSuggestions = async (input) => {
        if (input.length < 2) {
            setSuggestions([]);
            return;
        }
        input = input.toLowerCase();

        const results = movies.filter((movie) => {
            return movie.title.toLowerCase().startsWith(input);
        });

        setSuggestions(results);
    };

    useEffect(() => {
        fetchMovies();
        fetchCountries();
        fetchAwards();
        const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);
        debouncedFetchSuggestions(searchTerm);
    }, [searchTerm]);

    const debounce = (func, delay) => {
        let debounceTimer;
        return function (...args) {
            const context = this;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };



    // Load the uploaded image for preview
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
        setImage(file);
    };

    // Cancel image upload
    const cancelImageUpload = () => {
        setPreviewImage(null);
        setImage(null);
    };

    // Add an actor to the selected list
    //   const addActor = (actorName, actorImage) => {
    //     setSelectedActors([...selectedActors, { name: actorName, image: actorImage }]);
    //     setNewActorName('');
    //   };

    // Remove an actor from the selected list
    const removeActor = (index) => {
        const updatedActors = [...selectedActors];
        updatedActors.splice(index, 1);
        setSelectedActors(updatedActors);
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

    const handleActorClick = (suggestion) => {
        setSearchTerm('');
        setSuggestions([]);
        navigate(`/actors/${suggestion.id}`);
    };

    const handleOnChange = (event) => {
        const { name, value } = event.target;
        setMovie((prevMovie) => ({
            ...prevMovie,
            [name]: value,
        }));
    };

    return (
        <Cms activePage="dramaInput">

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex-1 p-12 pt-4">
                <div className="grid grid-cols-5 gap-8">
                    <div className="col-span-1">
                        {/* Image Upload Section */}
                        <div className="relative w-5/5 h-72 rounded-md mb-4 bg-gray-100 flex items-end justify-center">
                            {!previewImage ? (
                                <label
                                    htmlFor="upload-image"
                                    className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                                >
                                    <span className="text-gray-400 text-center">Click to upload movie poster</span>
                                    <input
                                        type="file"
                                        id="upload-image"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            ) : (
                                <img src={previewImage} alt="Preview" className="absolute inset-0 w-full h-full rounded-md object-cover" />
                            )}
                            {previewImage && (
                                <button
                                    className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded"
                                    onClick={cancelImageUpload}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button type="submit" className="p-1 bg-teal-600 w-20 rounded-xl text-white hover:bg-teal-700">
                                Submit
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-4 grid grid-cols-2 gap-4">
                        {/* Title and Alt Title */}
                        <div className="col-span-4 grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="title"
                                placeholder="Title"
                                className="bg-gray-100 p-2 rounded-md w-full text-black"
                                value={movie.title}
                                onChange={handleOnChange}
                            />
                            <input
                                type="text"
                                name="altTitle"
                                placeholder="Alternative Title"
                                className="bg-gray-100 p-2 rounded-md w-full text-black"
                                value={movie.altTitle}
                                onChange={handleOnChange}
                            />
                        </div>

                        {/* Year and Country */}
                        <div className="col-span-3 grid grid-cols-7 gap-4">
                            <select
                                className="bg-gray-100 p-2 rounded-md w-full text-black"
                                value={movie.year}
                                name="year"
                                onChange={handleOnChange}
                            >
                                <option value="">All Years</option> {/* Default empty value */}
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="bg-gray-100 p-2 rounded-md w-full text-black col-span-2"
                                value={movie.country}
                                name='country'
                                onChange={handleOnChange}
                            >
                                <option value="" disabled selected>
                                    Country
                                </option>
                                {countries.map((country) => (
                                    <option key={country.id} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                name='availability'
                                placeholder="Availability"
                                className="bg-gray-100 p-2 rounded-md w-full text-black col-span-3"
                                value={movie.availability}
                                onChange={handleOnChange}
                            />
                        </div>

                        {/* Synopsis */}
                        <div className="col-span-4">
                            <textarea
                                type="text"
                                name='synopsis'
                                placeholder="Synopsis"
                                rows="4"
                                className="bg-gray-100 p-2 rounded-md w-full text-black resize-none"
                                value={movie.synopsis}
                                onChange={handleOnChange}
                            />
                        </div>

                        {/* Genres */}
                        <div className="col-span-4">
                            <div className="p-4 border border-gray-100 rounded-xl">
                                <h3 className="font-bold mb-2 text-center">Select Genres</h3>
                                <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-4 p-2">
                                    {/* Genres with checkboxes */}
                                    {['Adventure', 'Romance', 'Drama', 'Slice of Life', 'Action', 'Comedy', 'Fantasy', 'Science Fiction', 'Thriller', 'Horror', 'Mystery', 'Documentary', 'Historical', 'Musical', 'Western', 'Animation', 'Biography', 'Family', 'Sport', 'War', 'Superhero', 'Dystopian', 'Crime', 'Teen', 'Martial Arts', 'Parody', 'Kids', 'Fantasy', 'Adventure', 'Romantic Comedy', 'Action Comedy', 'Science Fantasy', 'Psychological', 'Noir', 'Disaster', 'Dance', 'Road', 'Satire', 'Experimental', 'Surreal', 'Gothic', 'Post-Apocalyptic', 'Vampire', 'Zombie', 'Martial Arts', 'Social', 'Cooking', 'Fitness', 'Romantic Drama'].map(
                                        (genre) => (
                                            <label key={genre} className="flex items-center space-x-2">
                                                <input type="checkbox" className="form-checkbox h-6 w-6" />
                                                <span>{genre}</span>
                                            </label>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Add Actors */}
                        <div className="col-span-2">
                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search Actor Names"
                                value={newActorName}
                                onChange={(e) => setNewActorName(e.target.value)}
                                className="bg-gray-100 p-2 rounded-md w-1/2 mb-1 text-black"
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
                                                onClick={() => handleActorClick(suggestion)} // Pass the entire suggestion object
                                            >
                                                {suggestion.title}
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Selected Actors Section */}
                            <div className="grid-cols-3 sm:grid-cols-9 gap-4" id="selected-actors">
                                {selectedActors.map((actor, index) => (
                                    <div key={index} className="flex flex-col items-center relative">
                                        <div className="w-20 h-24 bg-gray-200 rounded-lg overflow-hidden">
                                            <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-gray-300 text-sm text-center">{actor.name}</p>
                                        <button
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                                            onClick={() => removeActor(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Trailer and Award */}
                        <div className="col-span-4 grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name='trailer'
                                placeholder="Link Trailer"
                                className="bg-gray-100 p-2 rounded-md w-full text-black"
                                value={movie.trailer}
                                onChange={handleOnChange}
                            />
                            <select
                                className="bg-gray-100 p-2 rounded-md w-full text-black z-10"
                                value={movie.award}
                                name='award'
                                onChange={(e) => setMovie({ ...movie, award: e.target.value })}
                            >
                                <option value="" disabled selected>
                                    Award
                                </option>
                                {awards.map((award) => (
                                    <option key={award.id} value={`${award.name} (${award.year})`}>
                                        {`${award.name} (${award.year})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </form>
        </Cms>
    );
};

export default DramaInput;
