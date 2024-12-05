import React, { useState, useEffect } from 'react';
import Cms from '../components/cms';

const ITEMS_PER_PAGE = 10;

const Genres = () => {
    const [genres, setGenres] = useState([]);
    const [genre, setGenre] = useState("");
    const [isEditing, setIsEditing] = useState(null);
    const [editedGenreName, setEditedGenreName] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const handleSort = () => {
        const sortedGenres = [...genres];
        if (sortOrder === 'asc') {
            sortedGenres.sort((a, b) => a.name.localeCompare(b.name));
            setSortOrder('desc');
        } else {
            sortedGenres.sort((a, b) => b.name.localeCompare(a.name));
            setSortOrder('asc');
        }
        setGenres(sortedGenres);
    };

    const fetchGenres = async () => {
        try {
            const response = await fetch('http://localhost:3005/api/genres');
            const data = await response.json();
            setGenres(data);
        } catch (error) {
            console.error('Failed to fetch genres:', error);
        }
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

    useEffect(() => {
        fetchGenres();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (genre) {
            const duplicate = genres.some(existingGenre =>
                existingGenre.name.toLowerCase() === genre.toLowerCase()
            );

            if (duplicate) {
                setModalMessage("Genre already exists!");
                setIsModalOpen(true);
                return;
            }

            try {
                const response = await fetch('http://localhost:3005/api/genres', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: genre }),
                });

                if (response.ok) {
                    const newGenre = await response.json();
                    setGenres((prevGenres) => [newGenre, ...prevGenres]);
                    setGenre("");
                } else {
                    console.error('Failed to add genre');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    // Handle genre deletion
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this genre?");
        if (confirmDelete) {
            try {
                const response = await fetch(`http://localhost:3005/api/genres/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setGenres(genres.filter(genre => genre.id !== id));
                } else {
                    console.error('Failed to delete genre');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    // Handle genre rename
    const handleRename = async (id) => {
        if (!editedGenreName) return;

        try {
            const response = await fetch(`http://localhost:3005/api/genres/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: editedGenreName }),
            });

            if (response.ok) {
                const updatedGenre = await response.json();
                setGenres(genres.map(genre =>
                    genre.id === id ? updatedGenre : genre
                ));
                setIsEditing(null);
                setEditedGenreName("");
            } else {
                console.error('Failed to rename genre');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(null);
        setEditedGenreName("");
    };

    const filteredGenres = genres.filter(genre =>
        genre.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredGenres.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentGenres = filteredGenres.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <Cms activePage="genres">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} message={modalMessage} />

            {/* Main Container for Form and Table */}
            <div className="w-full p-4 mb-6 max-w-full mx-auto">

                {/* Genre Form and Search Bar */}
                <div className="flex justify-between items-center mb-10">

                    {/* New Genre Input Section */}
                    <form onSubmit={handleSubmit} className="flex items-center space-x-4 w-2/5">
                        <label className="text-white font-bold" htmlFor="genre">Genre</label>
                        <input
                            id="genre"
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="p-1 rounded-md bg-gray-100 text-black focus:outline-none w-full"
                            placeholder="Input new genre here"
                        />
                        <button type="submit" className="p-1 px-2 bg-teal-500 rounded-md text-white hover:bg-teal-600">Submit</button>
                    </form>

                    {/* Search Bar Section */}
                    <div className="w-1/2 flex justify-end">
                        <input
                            type="text"
                            placeholder="Search genre..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-1 rounded-lg bg-gray-100 text-black focus:outline-none w-1/2"
                        />
                    </div>
                </div>

                {/* Genre List Table */}
                <table className="w-full text-left border-collapse p-4 mb-5 max-w-full mx-auto">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th style={{ width: '100px' }} className="px-4 py-3">ID</th>
                            <th style={{ width: '100px' }} className="px-4 py-3">
                                Genres
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
                        {currentGenres.map((genre, index) => (
                            <tr key={genre.id} className="bg-white">
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800">{startIndex + index + 1}</td>
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800" colSpan="5">
                                    {isEditing === genre.id ? (
                                        <input
                                            type="text"
                                            value={editedGenreName || genre.name}
                                            onChange={(e) => setEditedGenreName(e.target.value)}
                                            className="p-1 rounded-md bg-gray-300 text-black focus:outline-none"
                                            placeholder="New genre name"
                                        />
                                    ) : (
                                        genre.name
                                    )}
                                </td>
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800 text-center">
                                    {isEditing === genre.id ? (
                                        <>
                                            <button
                                                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                                                onClick={handleCancelEdit}>Cancel
                                            </button>
                                            <button
                                                className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 ml-2"
                                                onClick={() => handleRename(genre.id)}>Save
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                                                onClick={() => {
                                                    setIsEditing(genre.id);
                                                    setEditedGenreName(genre.name);
                                                }}>Edit
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 ml-2"
                                                onClick={() => handleDelete(genre.id)}>Delete
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

export default Genres;
