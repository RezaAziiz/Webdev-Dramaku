import React, { useState, useEffect } from 'react';
import Cms from '../components/cms';

const CmsActors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    country: '',
    actorName: '',
    birthDate: '',
    photo: null, // Store the photo file as a blob
  });
  const [actorsData, setActorsData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [editId, setEditId] = useState(null);
  const [previewImage, setPreviewImage] = useState(''); // State for image preview
  const [sortConfig, setSortConfig] = useState({ key: null, order: 'asc' });
  const [sortedActors, setSortedActors] = useState(actorsData);



  const handleSort = (key) => {
    let order = 'asc';

    // Toggle order if the same key is clicked
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }

    // Sort logic
    const newSortedActors = [...sortedActors].sort((a, b) => {
      if (key === 'birthDate') {
        return order === 'asc' ? new Date(a.birthDate) - new Date(b.birthDate) : new Date(b.birthDate) - new Date(a.birthDate);
      } else if (key === 'country') {
        return order === 'asc' ? a.country.localeCompare(b.country) : b.country.localeCompare(a.country);
      } else if (key === 'actorName') {
        return order === 'asc' ? a.actorName.localeCompare(b.actorName) : b.actorName.localeCompare(a.actorName);
      }
      return 0;
    });

    setSortedActors(newSortedActors);
    setSortConfig({ key, order });
  };

  useEffect(() => {
    fetchCountries();
    fetchActors();
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

  const fetchActors = async () => {
    try {
      const response = await fetch("http://localhost:3005/actors");
      if (!response.ok) {
        throw new Error("Failed to fetch actors");
      }
      const data = await response.json();
      console.log(data); // Cek apakah data sudah memiliki kolom birth_date
      setActorsData(data); 
      setSortedActors(data); // Salin data ke sortedActors untuk ditampilkan
    } catch (error) {
      console.error("Error fetching actors:", error);
    }
  };
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Use functional state update to ensure you have the latest formData
      setFormData(prevFormData => ({
        ...prevFormData,
        photo: file, // Store the file as a Blob
      }));
      setPreviewImage(URL.createObjectURL(file)); // Set the preview image
    }
  };


  const handleEditClick = (actor) => {
    setEditId(actor.id);
    setFormData({
      country: actor.country_id || '',
      actorName: actor.actor_name || '',
      birthDate: actor.birth_date || '',
      photo: null, // Set photo to null for editing
    });
    setPreviewImage(actor.photo); // Set preview for edit
  };

  const handleSaveClick = async (id) => {
    const formDataForUpdate = new FormData();
    formDataForUpdate.append('country_id', formData.country);
    formDataForUpdate.append('name', formData.actorName);
    formDataForUpdate.append('birth_date', formData.birthDate);
    if (formData.photo) {
      formDataForUpdate.append('photo', formData.photo);
    }
  
    try {
      const response = await fetch(`http://localhost:3005/actors/${id}`, {
        method: 'PUT',
        body: formDataForUpdate,
      });
  
      if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error(`Error: ${errorResponse || response.statusText}`);
      }
  
      setEditId(null);
      fetchActors();
    } catch (error) {
      console.error('Error updating actor:', error);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3005/actors/${id}`, {
        method: "DELETE",
      });
      fetchActors(); // Refresh data after delete
    } catch (error) {
      console.error("Error deleting actor:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Current formData:', formData);

    if (!formData.photo) {
      console.error('Photo is required');
      alert('Please upload a photo before submitting.');
      return;
    }

    const formDataForActor = new FormData();
    formDataForActor.append('country_id', formData.country);
    formDataForActor.append('name', formData.actorName);
    formDataForActor.append('birth_date', formData.birthDate);
    formDataForActor.append('photo', formData.photo);

    try {
      const response = await fetch("http://localhost:3005/actors", {
        method: "POST",
        body: formDataForActor,
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error(`Error: ${errorResponse || response.statusText}`);
      }

      // Refresh actors data and reset form
      setFormData({ country: '', actorName: '', birthDate: '', photo: null });
      setPreviewImage('');
      fetchActors();
    } catch (error) {
      console.error("Error creating actor:", error);
    }
  };

  const formatBirthdate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' }; // You can customize this format
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options); // Use the browser's locale
  };


  return (
    <Cms activePage="actors">
      <div className="w-full p-0">
      <form onSubmit={handleSubmit}>
  <div className="flex space-x-4">
    {/* Upload Picture Section */}
    <div className="bg-gray-700 rounded w-2/ h-40 flex flex-col justify-center items-center">
      <label htmlFor="upload-picture" className="mb-2 text-white">Upload Picture</label>
      <input
        type="file"
        id="upload-picture"
        name="photo"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        className="bg-teal-500 hover:bg-teal-600 text-white py-1 px-2 rounded"
        onClick={(event) => {
          event.preventDefault(); // Prevent form validation
          document.getElementById('upload-picture').click();
        }}
      >
        Choose File
      </button>
      {/* Image preview section */}
      {previewImage && (
        <div className="mt-4">
          <img src={previewImage} alt="Preview" className="w-20 h-20 rounded" />
        </div>
      )}
    </div>

    {/* Form Fields Section */}
    <div className="flex-1 flex flex-col space-y-4">
      <div className="flex space-x-4">
        <div>
          <label className="text-white font-bold" htmlFor="country">Country</label>
          <select
            id="country"
            name="country"
            className="rounded-lg ml-9 bg-gray-100 text-black focus:outline-none h-8 w-40"
            value={formData.country}
            onChange={handleChange}
            required
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.id} value={country.id}>{country.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-white font-bold" htmlFor="birthDate">Birth Date</label>
          <input
            id="birthDate"
            type="date"
            name="birthDate"
            className="rounded-lg ml-4 bg-gray-100 text-black focus:outline-none h-8 w-40"
            value={formData.birthDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div>
        <label className="text-white font-bold" htmlFor="actorName">Actor Name</label>
        <input
          id="actorName"
          type="text"
          name="actorName"
          placeholder="insert actor name here.."
          className="rounded-lg ml-2 bg-gray-100 text-black focus:outline-none h-8 w-40"
          value={formData.actorName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <button type="submit" className="bg-teal-600 w-20 rounded-xl text-white hover:bg-teal-700 h-8">
          {editId ? 'Update' : 'Submit'}
        </button>
      </div>
    </div>
  </div>
</form>



        <div className="flex justify-end mb-4 mt-5">
          <input
            type="text"
            placeholder="Search in Table"
            className="bg-gray-700 p-2 rounded w-1/4"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="overflow-x-auto">
          <div className="max-h-[400px] overflow-y-auto rounded-xl">
            <table className="min-w-full bg-gray-800 rounded-xl">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3" style={{ width: '100px' }}>ID</th>
                  <th className="px-4 py-3" style={{ width: '100px' }}>
                    Countries
                    <button
                      onClick={() => handleSort('country')}
                      className="ml-2 text-xs"
                      aria-label={`Sort by country ${sortConfig.key === 'country' ? (sortConfig.order === 'asc' ? 'descending' : 'ascending') : ''}`}>
                      <span>{sortConfig.key === 'country' ? (sortConfig.order === 'asc' ? '▲' : '▼') : ''}</span>
                    </button>
                  </th>
                  <th className="px-4 py-3" style={{ width: '100px' }}>
                    Actor Name
                    <button
                      onClick={() => handleSort('actorName')}
                      className="ml-2 text-xs"
                      aria-label={`Sort by actor name ${sortConfig.key === 'actorName' ? (sortConfig.order === 'asc' ? 'descending' : 'ascending') : ''}`}>
                      <span>{sortConfig.key === 'actorName' ? (sortConfig.order === 'asc' ? '▲' : '▼') : ''}</span>
                    </button>
                  </th>
                  <th className="px-4 py-3" style={{ width: '100px' }}>
                    Birth Date
                    <button
                      onClick={() => handleSort('birthDate')}
                      className="ml-2 text-xs"
                      aria-label={`Sort by birth date ${sortConfig.key === 'birthDate' ? (sortConfig.order === 'asc' ? 'descending' : 'ascending') : ''}`}>
                      <span>{sortConfig.key === 'birthDate' ? (sortConfig.order === 'asc' ? '▲' : '▼') : ''}</span>
                    </button>
                  </th>
                  <th className="py-3" style={{ width: '100px' }}>Photo</th>
                  <th className="py-3 text-center" style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
  {actorsData
    .filter(actor => actor.name && actor.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((actor, index) => (
      <tr
        key={actor.id}
        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
      >
        <td className="py-3 px-6 text-center text-gray-800">{index + 1}</td>
        <td className="py-3 px-6 text-center text-gray-800">{actor.country_name}</td>
        <td className="py-3 px-6 text-center text-gray-800">{actor.name}</td> {/* Pastikan nama field */}
        <td className="py-3 px-6 text-center text-gray-800">{formatBirthdate(actor.birthdate)}</td> {/* Sesuaikan nama field */}
        <td className="py-3 px-6 text-center">
        <img 
          src={actor.url_photos} 
          alt={actor.name} 
          className="w-40 h-40 object-cover rounded-lg shadow-md" 
        />
        </td>

        <td className="py-3 px-6 border-b border-gray-300 text-center">
          <div className="flex justify-center space-x-2">
            {editId === actor.id ? (
              <button
                onClick={() => handleSaveClick(actor.id)}
                className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
              >
                Save
              </button>
            ) : (
              <>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                  onClick={() => handleEditClick(actor)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                  onClick={() => handleDelete(actor.id)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    ))}
</tbody>

            </table>

          </div>
        </div>
      </div>
    </Cms>
  );
};

export default CmsActors;
