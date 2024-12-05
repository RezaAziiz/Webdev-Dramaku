import React, { useState } from 'react';
import Cms from '../components/cms';
import ModalDrama from '../components/modalDrama';

function DramaList() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to open modal
    const openModal = () => {
        setIsModalOpen(true);
    };

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <Cms activePage="drama">
            <div>
                <main className="flex-1 p-6 ml-64 pt-12">
                    {/* Filter and Show options */}
                    <div className="flex justify-between p-4 mb-4 max-w-full mx-auto w-3/4">
                        <div>
                            <span className="mr-2">Filtered by:</span>
                            <select className="bg-gray-700 text-white p-2 rounded-lg">
                                <option>Unapproved</option>
                                <option>Approved</option>
                            </select>
                        </div>
                        <div>
                            <span className="mr-2">Shows</span>
                            <select className="bg-gray-700 text-white p-2 rounded-lg">
                                <option>10</option>
                                <option>20</option>
                                <option>30</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-3/4 text-justify border-collapse p-4 mb-6 max-w-full mx-auto">
                        <thead className="bg-purple-900 text-white">
                            <tr>
                                <th className="py-4 px-3 text-center w-5">#</th>
                                <th className="py-4 px-12 text-center">Drama</th>
                                <th className="py-4 px-6 text-center">Actors</th>
                                <th className="py-4 px-3 text-center">Genres</th>
                                <th className="py-4 px-3 text-center">Synopsis</th>
                                <th className="py-4 px-3 text-center">Status</th>
                                <th className="py-4 px-7 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-blue-900 text-white">
                                <td className="py-2 px-3 w-5">1</td>
                                <td className="py-2 px-3">[2024] Japan - Eye Love You</td>
                                <td className="py-2 px-3">Takuya Kimura, Takeuchi Yuko, Neinen Reina</td>
                                <td className="py-2 px-3 text-center">Romance, Adventures, Comedy</td>
                                <td className="py-2 px-3">
                                    I love this drama. It taught me a lot about money and finance. Love is not everything. We need to face the reality too. Being stoic is the best.
                                </td>
                                <td className="py-2 px-3 text-center">Unapproved</td>
                                <td className="py-2 px-3 text-red-500">
                                    <a href="#" className="hover:underline" onClick={openModal}>Edit</a> | <a href="#" className="hover:underline">Delete</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </main>

                {isModalOpen && <ModalDrama closeModal={closeModal} />}
            </div>
        </Cms>
    );
}

export default DramaList;
