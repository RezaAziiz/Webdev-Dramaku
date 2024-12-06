import React, { useState, useEffect } from 'react';
import Cms from '../components/cms';

const DramaInput = () => {
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedActors, setSelectedActors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [actors, setActors] = useState([]);
    const [genres, setGenres] = useState([]);
    const [countries, setCountries] = useState([]);
    const [awards, setAwards] = useState([]);
    const years = Array.from({ length: 40 }, (_, index) => 1985 + index);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedAwards, setSelectedAwards] = useState([]);
    const [movie, setMovie] = useState({
        title: '',
        altTitle: '',
        year: '',
        country_id: '',
        availability: '',
        synopsis: '',
        genres: [],
        actors: [],
        trailer: '',
        awards: [],
        image: null,
    });

    const availablePlatforms = [
        'Amazon Prime Video', 'Apple TV', 'Crunchyroll', 'Disney+',
        'Google Play Movies', 'Netflix', 'Prime Video', 'YouTube'
    ];

    const handleAvailabilityChange = (platform) => {
        setMovie((prevMovie) => {
          const updatedAvailability = prevMovie.availability.split(',').map(item => item.trim());
    
          if (updatedAvailability.includes(platform)) {
            updatedAvailability.splice(updatedAvailability.indexOf(platform), 1); // Remove the platform
          } else {
            updatedAvailability.push(platform); // Add the platform
          }
    
          // Join the updated list of platforms into a single string without leading/trailing commas
          const formattedAvailability = updatedAvailability.filter(Boolean).join(', ');
    
          return {
            ...prevMovie,
            availability: formattedAvailability  // Update the availability field without leading commas
          };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('title', movie.title);
        formData.append('alt_title', movie.altTitle);
        formData.append('year', movie.year);
        formData.append('availability', movie.availability); // Send the comma-separated availability
        formData.append('synopsis', movie.synopsis);
        formData.append('trailer', movie.trailer);
        formData.append('country_id', movie.country_id);

        // Append selected genres as an array of genre IDs
        selectedGenres.forEach((genreId) => {
            formData.append('genres[]', genreId);
        });

        // Append selected awards as an array of award IDs
        selectedAwards.forEach((awardId) => {
            formData.append('awards[]', awardId);
        });

        // Append selected actors as an array of actor IDs
        selectedActors.forEach((actor) => {
            formData.append('actors[]', actor.id); // Assuming actor object has `id`
        });

        if (movie.photo) {
            formData.append('photo', movie.photo); // Add image file
        }

        try {
            const response = await fetch('http://localhost:3005/api/movies', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Movie posted successfully:', data);
                setMovie({
                    title: '',
                    altTitle: '',
                    country_id: '',
                    availability: '',
                    synopsis: '',
                    trailer: '',
                    year: '',
                    photo: null,
                });
                setPreviewImage(null);
                setSelectedGenres([]);
                setSelectedAwards([]);
                setSelectedActors([]);  // Reset selected actors
                window.alert(`Drama ${movie.title} has been successfully created.`);
            } else {
                console.error('Failed to post movie:', response.statusText);
            }
        } catch (error) {
            console.error('Error posting movie:', error);
        }
    };



    const fetchGenres = async () => {
        try {
            const response = await fetch('http://localhost:3005/api/genres');
            const data = await response.json();
            setGenres(data);
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

            // Sort data berdasarkan nama award (ascending)
            const sortedAwards = data.sort((a, b) => {
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            });

            setAwards(sortedAwards); // Menyimpan data yang sudah di-sort
        } catch (error) {
            console.error('Error fetching awards:', error);
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
            setSuggestions([]);
            return;
        }

        input = input.toLowerCase();

        const results = actors.filter((actor) => {
            return actor.name.toLowerCase().startsWith(input);
        });

        setSuggestions(results);
    };

    useEffect(() => {
        fetchActors();
        fetchGenres();
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

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setMovie(prevMovie => ({
                ...prevMovie,
                photo: file, // Simpan file sebagai Blob untuk dikirim ke server
            }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };


    // Cancel image upload
    const cancelImageUpload = () => {
        setPreviewImage(null);
        setMovie(prevMovie => ({
            ...prevMovie,
            photo: null,
        })
        );
    };

    const handleActorClick = (actor) => {
        if (selectedActors.length < 9) {
            setSelectedActors([...selectedActors, actor]); // Add actor to selected list
        }
        setSearchTerm('');  // Clear the search field
        setSuggestions([]); // Clear suggestions
    };

    const removeActor = (index) => {
        const updatedActors = [...selectedActors];
        updatedActors.splice(index, 1);
        setSelectedActors(updatedActors);  // Remove actor from selected list
    };


    const handleGenreChange = (genre) => {
        setSelectedGenres((prevSelectedGenres) =>
            prevSelectedGenres.includes(genre)
                ? prevSelectedGenres.filter((g) => g !== genre)
                : [...prevSelectedGenres, genre]
        );
    };

    const handleAwardChange = (award) => {
        setSelectedAwards((prevSelectedAwards) =>
            prevSelectedAwards.includes(award)
                ? prevSelectedAwards.filter((a) => a !== award)
                : [...prevSelectedAwards, award]
        );
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
                                        name='image'
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
                                value={movie.country_id}
                                name='country_id'
                                onChange={handleOnChange}
                            >
                                <option value="" disabled selected>
                                    Country
                                </option>
                                {countries.map((country) => (
                                    <option key={country.id} value={country.id}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Availability */}
                        <div className="col-span-4">
                            <div className="p-4 border border-gray-100 rounded-xl">
                                <h3 className="font-bold mb-2 text-center">Select Availability</h3>
                                <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-4 p-2">
                                    {availablePlatforms.map((platform) => (
                                        <label key={platform} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                value={platform}
                                                checked={movie.availability.split(',').map(item => item.trim()).includes(platform)}
                                                onChange={() => handleAvailabilityChange(platform)}
                                                className="form-checkbox h-6 w-6"
                                            />
                                            <span>{platform}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
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
                                    {genres.map((genre) => (
                                        <label key={genre.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                value={genre.id} // Gunakan genre.id sebagai value
                                                checked={selectedGenres.includes(genre.id)}
                                                onChange={() => handleGenreChange(genre.id)}
                                                className="form-checkbox h-6 w-6"
                                            />
                                            <span>{genre.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Add Actors */}
                        <div className="relative w-full col-span-4"> {/* Parent container is relative and full width */}
                            {/* Search Input and Suggestions Wrapper */}
                            <div className="relative w-full sm:w-1/4"> {/* Restricting width for smaller screens */}
                                <input
                                    type="text"
                                    placeholder="Search Actor Names"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-100 p-2 rounded-md w-full mb-1 text-black"
                                />

                                {/* Suggestions Dropdown */}
                                {suggestions.length > 0 && (
                                    <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                        {suggestions
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 text-gray-900 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleActorClick(suggestion)}
                                                >
                                                    {suggestion.name}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Actors Section */}
                            <div className="flex flex-wrap gap-4 mt-4 w-full" id="selected-actors"> {/* Full width container */}
                                {selectedActors.map((actor, index) => (
                                    <div key={index} className="flex flex-col items-center relative">
                                        <div className="w-20 h-24 bg-gray-200 rounded-lg overflow-hidden">
                                            <img src={actor.url_photos} alt={actor.name} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-gray-200 text-xs text-center max-w-[70px] break-words">
                                            {actor.name.split(' ').map((word, i) => (
                                                <span key={i}>
                                                    {word} <br />
                                                </span>
                                            ))}
                                        </p>
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
                        </div>

                        <div className="col-span-4">
                            <div className="p-4 border border-gray-100 rounded-xl">
                                <h3 className="font-bold mb-2 text-center">Select Awards</h3>
                                <div className="max-h-72 overflow-y-auto grid grid-cols-1 gap-3 p-2">
                                    {awards.map((award) => (
                                        <label key={award.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                value={award.id} // Gunakan genre.id sebagai value
                                                checked={selectedAwards.includes(award.id)}
                                                onChange={() => handleAwardChange(award.id)}
                                                className="form-checkbox h-6 w-6"
                                            />
                                            <span>{award.name} ({award.year})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Cms >
    );
};

export default DramaInput;
