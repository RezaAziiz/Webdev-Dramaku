import React, { useState, useEffect } from 'react';
import Cms from '../components/cms';

const ITEMS_PER_PAGE = 8;

const CmsAwards = () => {
  const [formData, setFormData] = useState({
    country_id: '',
    name: '',
    year: '',
  });
  const [awardsData, setAwardsData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [sortField, setSortField] = useState('name'); // Default sorting field
  const [sortOrder, setSortOrder] = useState('asc'); // Default sorting order
  const [awards, setAwards] = useState([]);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editedAward, setEditedAward] = useState(null);

  useEffect(() => {
    fetchCountries();
    fetchAwards();
  }, []);

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
      setAwardsData(data);
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditClick = (award) => {
    setEditId(award.id); // Set ID of award being edited
    setEditedAward({
      country_id: award.country_id,
      name: award.name,
      year: award.year,
    });
  };

  const handleCancelClick = () => {
    setEditId(null); // Reset edit mode
    setEditedAward(null);
  };

  const handleSaveClick = async () => {
    try {
      await fetch(`http://localhost:3005/awards/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedAward),
      });
      setEditId(null); // Exit edit mode
      setEditedAward(null); // Clear edited award data
      fetchAwards(); // Refresh awards data
    } catch (error) {
      console.error('Error updating award:', error);
    }
  };

  const handleChangeEdit = (e) => {
    setEditedAward({
      ...editedAward,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

     // Ensure formData has the expected structure
  const formattedData = {
    country_id: parseInt(formData.country_id, 10), // Convert to number if needed
    name: formData.name.trim(), // Trim any whitespace
    year: parseInt(formData.year, 10), // Convert to number if needed
  };

  console.log("Submitting award:", JSON.stringify(formattedData));

    try {
      // Send a POST request to the awards API
      const response = await fetch("http://localhost:3005/awards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData), // Make sure formData has the correct structure
      });

      // Check if the response is okay
      if (response.ok) {
        console.log("Award created successfully");
        fetchAwards(); // Refresh the awards data
        setFormData({ country_id: '', name: '', year: '' }); // Reset form data after submission
      } else {
        const errorText = await response.text(); // Get the response text for debugging
        console.error("Error creating award:", errorText);
      }
    } catch (error) {
      console.error("Server error:", error);
    }
  };

  const filteredAwards = awardsData.filter(award =>
    award.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const handleSort = (field) => {
    const sortedAwards = [...awardsData];

    if (sortField === field && sortOrder === 'asc') {
      // If already sorted by this field in ascending order, sort in descending order
      sortedAwards.sort((a, b) => {
        if (field === 'year') {
          return b.year - a.year; // For numeric sorting
        }
        return b.name.localeCompare(a.name); // For string sorting
      });
      setSortOrder('desc');
    } else {
      // Sort in ascending order
      sortedAwards.sort((a, b) => {
        if (field === 'year') {
          return a.year - b.year; // For numeric sorting
        }
        return a.name.localeCompare(b.name); // For string sorting
      });
      setSortOrder('asc');
    }

    setAwardsData(sortedAwards);
    setSortField(field); // Update the current sorting field
  };


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this award?");
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:3005/awards/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchAwards(); // Refresh the awards after deletion
        } else {
          console.error('Failed to delete award');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Adjust pagination logic based on filteredAwards
  const totalPages = Math.ceil(filteredAwards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAwards = filteredAwards.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Cms activePage="awards">
      {/* Main Container for Form and Table */}
      <div className="w-full p-4 mb-5 max-w-full mx-auto">

        {/* Award Form and Search Bar */}
        <div className="flex justify-between items-center mb-7">
          {/* New Award Input Section */}
          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            <table className="w-full">
              <tbody>
                {/* Row 1: Country, Year, and Submit Button */}
                <tr>
                  <td colSpan="3"> {/* Award Name spans columns 1-3 */}
                    <label className="text-white font-bold" htmlFor="name">Award Name:</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      className="p-1 rounded-md bg-gray-100 text-black focus:outline-none h-8 w-full"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Input new Award here"
                    />
                  </td>
                </tr>

                {/* Row Award Name and Search Bar */}
                <tr>
                  <td className="pr-2 pt-3">
                    <label className="text-white font-bold mb-1" htmlFor="country">Country: </label>
                    <select
                      id="country"
                      name="country_id"
                      className="p-1 rounded-md bg-gray-100 text-black focus:outline-none h-8 w-2/5"
                      value={formData.country_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="pl-2 pt-3">
                    <label className="text-white font-bold mb-1" htmlFor="year">Year: </label>
                    <input
                      id="year"
                      type="text"
                      name="year"
                      className="p-1 rounded-md bg-gray-100 text-black focus:outline-none h-8 w-2/5"
                      placeholder="YYYY"
                      value={formData.year}
                      onChange={handleChange}
                    />
                  </td>
                  <td className="pl-2 pt-3">
                    <button type="submit" className="p-1 px-2 bg-teal-500 rounded-md text-white hover:bg-teal-600">
                      Submit
                    </button>
                  </td>
                  <td className="pl-2 pt-3" colSpan="2"> {/* Search Bar spans columns 4-5 */}
                    <input
                      type="text"
                      placeholder="Search award..."
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="p-1 rounded-lg bg-gray-100 text-black focus:outline-none w-full"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>

        {/* Awards List Table */}
        <table className="w-full text-left border-collapse p-4 mb-5 max-w-full mx-auto">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-1/7 px-4 py-3">ID</th>
              <th className="w-1/7 px-4 py-3">Country</th>
              <th className="w-1/7 px-4 py-3">Year
                <button onClick={() => handleSort('year')} className="ml-2 text-xs">
                  {sortField === 'year' && sortOrder === 'asc' ? '▲' : '▼'}
                </button>
              </th>
              <th className="w-1/7 px-4 py-3">Award
                <button onClick={() => handleSort('name')} className="ml-2 text-xs">
                  {sortField === 'name' && sortOrder === 'asc' ? '▲' : '▼'}
                </button>
              </th>
              <th className="w-1/7 px-4 py-3"></th>
              <th className="w-1/7 px-4 py-3"></th>
              <th className="w-1/7 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAwards.map((award, index) => (
              <tr key={award.id} className="bg-white">
                <td className="w-1/7 py-3 px-4 border-b border-gray-300 text-gray-800">
                  {startIndex + index + 1}
                </td>
                <td className="w-1/7 py-3 px-4 border-b border-gray-300 text-gray-800">
                  {editId === award.id ? (
                    <select
                      name="country_id"
                      value={editedAward.country_id}
                      onChange={handleChangeEdit}
                      className="rounded-lg bg-gray-200 text-black focus:outline-none h-8 w-3/4"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    award.country_name ? award.country_name : 'Unknown'
                  )}
                </td>
                <td className="w-1/7 py-3 px-4 border-b border-gray-300 text-gray-800">
                  {editId === award.id ? (
                    <input
                      type="text"
                      name="year"
                      value={editedAward.year}
                      onChange={handleChangeEdit}
                      className="p-2 rounded-lg bg-gray-200 text-black focus:outline-none h-8 w-1/5"
                    />
                  ) : (
                    award.year || "None"
                  )}
                </td>
                <td className="w-1/7 py-3 px-4 border-b border-gray-300 text-gray-800 break-words max-w-xs" colSpan="3">
                  {editId === award.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedAward.name}
                      onChange={handleChangeEdit}
                      className="p-1 rounded-lg bg-gray-200 text-black focus:outline-none h-8 w-full"
                    />
                  ) : (
                    award.name
                  )}
                </td>

                <td className="w-1/7 py-3 px-4 border-b border-gray-300 text-gray-800 text-center">
                  {editId === award.id ? (
                    <>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 mr-2"
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                        onClick={handleSaveClick}
                      >
                        Save
                      </button>

                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 mr-2"
                        onClick={() => handleEditClick(award)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                        onClick={() => handleDelete(award.id)}
                      >
                        Delete
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

export default CmsAwards;
