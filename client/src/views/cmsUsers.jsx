import React, { useState, useEffect } from 'react';
import Cms from '../components/cms';

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    return date.toLocaleString('en-GB', options).replace(',', '');
};

const Users = () => {
    const [users, setUsers] = useState([]); // users state holds user data
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortColumn, setSortColumn] = useState('username');
    const [searchQuery, setSearchQuery] = useState(""); // State for search input

    const handleSort = (column) => {
        const sortedUsers = [...users];
        if (sortColumn === column && sortOrder === 'asc') {
            sortedUsers.sort((a, b) => {
                if (column === 'created_at') {
                    return new Date(b.created_at) - new Date(a.created_at); // Sort by created_at
                }
                return b[column].localeCompare(a[column]); // Sort by username
            });
            setSortOrder('desc');
        } else {
            sortedUsers.sort((a, b) => {
                if (column === 'created_at') {
                    return new Date(a.created_at) - new Date(b.created_at); // Sort by created_at
                }
                return a[column].localeCompare(b[column]); // Sort by username
            });
            setSortOrder('asc');
        }
        setUsers(sortedUsers);
        setSortColumn(column); // Set the current sort column
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:3005/api/users'); // Fetch only non-deleted users
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const usersData = await response.json();
                setUsers(usersData);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleChangeRoleToAdmin = async (username) => {
        console.log(`Attempting to change role of user: ${username}`); // Log when the function is called
        if (window.confirm(`Are you sure you want to change the role of ${username} to Admin?`)) {
            try {
              const response = await fetch(`http://localhost:3005/api/users/${username}/role`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ role_id: 'Admin' }), // Change role to Admin
                });

                if (response.ok) {                  
                  window.alert(`${username} has been successfully change role to Admin.`);
  
                  const updatedUsers = users.map(user =>
                    user.username === username ? { ...user, role_id: 'Admin' } : user
                );
                setUsers(updatedUsers);
              }
                
            } catch (error) {
                console.error('Failed to change user role:', error);
            }
        }
    };

    const handleBanned = async (username) => {
      console.log(`Attempting to ban user: ${username}`); // Log when the function is called
      if (window.confirm(`Are you sure you want to ban ${username}?`)) {
          console.log(`User ${username} confirmed to be banned.`); // Log confirmation
          try {
              const response = await fetch(`http://localhost:3005/api/users/${username}/ban`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ banned: true }), // Set banned to true
              });
  
              if (response.ok) {
                  console.log('User banned:', username);
                  
                  // Show confirmation that the user is banned
                  window.alert(`${username} has been successfully banned.`);
  
                  // Remove the banned user from the table by filtering out from the users' state
                  const updatedUsers = users.filter(user => user.username !== username);
                  setUsers(updatedUsers);
              } else {
                  console.error('Failed to ban user:', response.statusText); // Log if response is not ok
              }
          } catch (error) {
              console.error('Failed to ban user:', error);
          }
      } else {
          console.log(`User ${username} canceled the ban.`); // Log if the action was canceled
      }
  };
  

    // Filter users based on search query
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().startsWith(searchQuery.toLowerCase())
    );

    // Adjust pagination logic based on filteredUsers
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <Cms activePage="users">
            <div className="w-full p-4 mb-5 max-w-full mx-auto">
                <div className="flex justify-end mb-10">
                    <input
                        type="text"
                        placeholder="Search user..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-1 rounded-md bg-gray-100 text-black focus:outline-none w-1/5" // Adjust width as needed
                    />
                </div>
                <table className="w-full text-left border-collapse p-4 mb-5 max-w-full mx-auto">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th style={{ width: '100px' }} className="px-4 py-3">ID</th>
                            <th style={{ width: '150px' }} className="px-4 py-3">
                                Username
                                <button onClick={() => handleSort('username')} className="ml-2 text-xs">
                                    {sortColumn === 'username' && sortOrder === 'asc' ? '▲' : '▼'}
                                </button>
                            </th>
                            <th style={{ width: '200px' }} className="px-4 py-3">Email</th>
                            <th style={{ width: '150px' }} className="px-4 py-3 text-center">Role</th>
                            <th style={{ width: '200px' }} className="px-4 py-3 text-center">
                                Created At
                                <button onClick={() => handleSort('created_at')} className="ml-2 text-xs">
                                    {sortColumn === 'created_at' && sortOrder === 'asc' ? '▲' : '▼'}
                                </button>
                            </th>
                            <th style={{ width: '100px' }} className="px-4 py-3"></th>
                            <th style={{ width: '100px' }} className="py-3 text-center" colSpan="2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user, index) => (
                            <tr key={user.id} className="bg-white">
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800">{startIndex + index + 1}</td>
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800">{user.username}</td>
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800">{user.email}</td>
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800 text-center">{user.role_id}</td>
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800 text-center">{formatDate(user.created_at)}</td>
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800"></td>
                                <td className="py-3 px-4 border-b border-gray-300 text-gray-800 text-center">
                                    <button
                                        className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                                        onClick={() => handleChangeRoleToAdmin(user.username)}>To Admin
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 ml-2"
                                        onClick={() => handleBanned(user.username)}>Banned
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

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

export default Users;
