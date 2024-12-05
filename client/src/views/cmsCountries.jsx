import React, { useState, useEffect } from 'react';
import Cms from '../components/cms';

const ITEMS_PER_PAGE = 10;

const Countries = () => {
    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState("");
    const [isEditing, setIsEditing] = useState(null); // Track which country is being edited
    const [editedCountryName, setEditedCountryName] = useState(""); // Store the new country name
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [sortOrder, setSortOrder] = useState('asc'); // Track sort order
    const [searchQuery, setSearchQuery] = useState(""); // State for search input
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
    const [modalMessage, setModalMessage] = useState("");

    const handleSort = () => {
        const sortedCountries = [...countries];
        if (sortOrder === 'asc') {
            sortedCountries.sort((a, b) => a.name.localeCompare(b.name));
            setSortOrder('desc'); // Set sort order to descending
        } else {
            sortedCountries.sort((a, b) => b.name.localeCompare(a.name));
            setSortOrder('asc'); // Set sort order to ascending
        }
        setCountries(sortedCountries);
    };

    const Modal = ({ isOpen, onClose, message }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-10 rounded-lg shadow-lg max-w-2xl mx-auto w-full"> {/* Max width and increased padding */}
                    <h2 className="text-2xl text-red-500 font-bold text-center">Warning!</h2> {/* Centered heading */}
                    <p className='text-black text-center mt-4'>{message}</p> {/* Centered message */}
                    <div className="flex justify-center mt-10"> {/* Centering the button */}
                        <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    // Fetch countries from the server
    const fetchCountries = async () => {
        try {
            const response = await fetch('http://localhost:3005/api/countries');
            const data = await response.json();
            setCountries(data);
        } catch (error) {
            console.error('Failed to fetch countries:', error);
        }
    };

    // Fetch countries when component mounts
    useEffect(() => {
        fetchCountries();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (country) {
            const duplicate = countries.some(existingCountry =>
                existingCountry.name.toLowerCase() === country.toLowerCase()
            );

            if (duplicate) {
                setModalMessage("Country already exists!"); // Set message for modal
                setIsModalOpen(true); // Open modal
                return;
            }

            try {
                const response = await fetch('http://localhost:3005/api/countries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: country }),
                });

                if (response.ok) {
                    const newCountry = await response.json();
                    setCountries((prevCountries) => [newCountry, ...prevCountries]);
                    setCountry(""); // Clear input field
                } else {
                    console.error('Failed to add country');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };


    // Handle country deletion
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this country?");
        if (confirmDelete) {
            try {
                const response = await fetch(`http://localhost:3005/api/countries/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setCountries(countries.filter(country => country.id !== id)); // Remove country from state
                } else {
                    console.error('Failed to delete country');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    // Handle country rename
    const handleRename = async (id) => {
        if (!editedCountryName) return; // Do nothing if input is empty

        try {
            const response = await fetch(`http://localhost:3005/api/countries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: editedCountryName }),
            });

            if (response.ok) {
                const updatedCountry = await response.json();
                setCountries(countries.map(country =>
                    country.id === id ? updatedCountry : country // Update the country in the list
                ));
                setIsEditing(null); // Exit editing mode
                setEditedCountryName(""); // Clear the edited country name
            } else {
                console.error('Failed to rename country');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Handle canceling the edit
    const handleCancelEdit = () => {
        setIsEditing(null); // Exit editing mode
        setEditedCountryName(""); // Clear the edited country name
    };

    // Filter countries based on search query
    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );

    // Adjust pagination logic based on filteredCountries
    const totalPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentCountries = filteredCountries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <Cms activePage="countries">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} message={modalMessage} />

            {/* Main Container for Form and Table */}
            <div className="w-full p-4 mb-5 max-w-full mx-auto">

                {/* Country Form and Search Bar */}
                <div className="flex justify-between items-center mb-10">

                    {/* New Country Input Section */}
                    <form onSubmit={handleSubmit} className="flex items-center space-x-4 w-2/5">
                        <label className="text-white font-bold" htmlFor="country">Country</label>
                        <input
                            id="country"
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="p-1 rounded-md bg-gray-100 text-black focus:outline-none w-full"
                            placeholder="Input new country here"
                        />
                        <button type="submit" className="p-1 px-2 bg-teal-500 rounded-md text-white hover:bg-teal-600">Submit</button>
                    </form>

                    {/* Search Bar Section */}
                    <div className="w-1/2 flex justify-end">
                        <input
                            type="text"
                            placeholder="Search country..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-1 rounded-lg bg-gray-100 text-black focus:outline-none w-1/2"
                        />
                    </div>
                </div>

                {/* Country List Table */}
                <table className="w-full text-left border-collapse p-4 mb-5 max-w-full mx-auto">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th style={{ width: '100px' }} className="px-4 py-3">ID</th>
                            <th style={{ width: '100px' }} className="px-4 py-3">
                                Countries
                                <button onClick={handleSort} className="ml-2 text-xs">
                                    {sortOrder === 'asc' ? '▲' : '▼'}
                                </button>
                            </th>
                            <th style={{ width: '100px' }} className="px-4 py-3"></th>
                            <th style={{ width: '100px' }} className="px-4 py-3"></th>
                            <th style={{ width: '100px' }} className="px-4 py-3"></th>
                            <th style={{ width: '100px' }} className="px-4 py-3"></th>
                            <th style={{ width: '100px' }} className="py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCountries.map((country, index) => (
                            <tr key={country.id} className="bg-white">
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800">{startIndex + index + 1}</td> {/* Column 1 */}
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800" colSpan="5"> {/* Column 2 */}
                                    {isEditing === country.id ? (
                                        <input
                                            type="text"
                                            value={editedCountryName || country.name} // Show previous value if editing
                                            onChange={(e) => setEditedCountryName(e.target.value)}
                                            className="p-1 rounded-md bg-gray-300 text-black focus:outline-none"
                                            placeholder="New country name"
                                        />
                                    ) : (
                                        country.name
                                    )}
                                </td>
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800 text-center"> {/* Actions column */}
                                    {isEditing === country.id ? (
                                        <>
                                            <button
                                                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                                                onClick={handleCancelEdit}>Cancel
                                            </button>
                                            <button
                                                className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 ml-2"
                                                onClick={() => handleRename(country.id)}>Save
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                                                onClick={() => {
                                                    setIsEditing(country.id); // Start editing
                                                    setEditedCountryName(country.name); // Set the edited country name
                                                }}>Edit
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 ml-2"
                                                onClick={() => handleDelete(country.id)}>Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex justify-center space-x-2 mt-4">
                    <button
                        className="p-2 bg-gray-200 text-black rounded-md hover:bg-gray-100 font-bold"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}>{"<<"}
                    </button>
                    <button
                        className="p-2 bg-gray-200 text-black rounded-md hover:bg-gray-100 font-bold"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}>{"<"}
                    </button>
                    <span className="flex items-center">
                        {currentPage} of {totalPages}
                    </span>
                    <button
                        className="p-2 bg-gray-200 text-black rounded-md hover:bg-gray-100 font-bold"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}>{">"}
                    </button>
                    <button
                        className="p-2 bg-gray-200 text-black rounded-md hover:bg-gray-100 font-bold"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}>{">>"}
                    </button>
                </div>
            </div>
        </Cms>
    );
};

export default Countries;
