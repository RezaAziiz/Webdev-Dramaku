import React from 'react';

function ModalDrama({ closeModal }) {
    return (
        <div
            id="editModal"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
        >
            <div className="bg-gray-700 text-white rounded-lg w-3/4 max-w-5xl p-4" onClick={(e) => e.stopPropagation()}>
                {/* Modal Content */}
                <div className="flex justify-center mb-4">
                    <button type="button" className="bg-teal-600 rounded-xl text-white hover:bg-teal-700 py-1 px-4 mr-2">
                        Approve
                    </button>
                    <button type="button" className="bg-red-500 rounded-xl text-white hover:bg-red-600 py-1 px-4 mr-2">
                        Delete
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 items-center">
                    {/* Left Section */}
                    <div className="flex justify-center md:justify-start">
                        <div className="w-72 h-48 rounded-lg shadow-lg overflow-hidden">
                            <img src="../dist/img_src/divergent.png" alt="Movie Poster" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-2">Title of the drama that makes two lines</h3>
                        <p className="text-gray-300 mb-2">Other titles: Title 2, Title 3, Title 4</p>
                        <p className="text-gray-300 mb-2">Year: 2024</p>
                        <p className="text-gray-300 mb-2">
                            Synopsis: In a world divided by factions based on virtues, Tris learns she's Divergent and won't fit in. When she
                            discovers a plot to destroy Divergents, Tris and the mysterious Four must find out what makes Divergents
                            dangerous.
                        </p>
                        <p className="text-gray-300 mb-2">Genre: Genre 1, Genre 2, Genre 3</p>
                        <p className="text-gray-300 mb-2">Rating: 3.5/5</p>
                        <p className="text-gray-300 mb-2">Availability: Fansub: @eoisub on X</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalDrama;
