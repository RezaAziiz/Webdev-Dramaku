import React, { useState, useEffect } from "react";
import axios from "axios";
import Cms from "../components/cms";

const ITEMS_PER_PAGE = 10;

const Comments = () => {
  const [filter, setFilter] = useState("");
  const [shows, setShows] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [commentsData, setCommentsData] = useState([]);  // Initially an empty array
  const [currentPage, setCurrentPage] = useState(1);

  const fetchComments = async () => {
    try {
      const response = await axios.get("http://localhost:3005/comments", {
        params: { searchTerm, shows, page: currentPage },
      });
  
      setCommentsData(response.data); // Set the comments data
  
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [searchTerm, shows, currentPage]);

  // Filter and search logic
  const filteredComments = commentsData.filter((comment) => {
    return (
      (filter === "" || Number(comment.rate) === Number(filter)) &&
      comment.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination calculations based on filtered comments
  const totalPages = Math.ceil(filteredComments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentComments = filteredComments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const renderStars = (rate) => {
    return "★".repeat(rate) + "☆".repeat(5 - rate);
  };

  const handleCheckboxChange = (index) => {
    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [index]: !prevCheckedItems[index],
    }));
  };

  const handleApprove = async () => {
    const idsToApprove = currentComments
      .filter((_, index) => checkedItems[index]) // Get the ids of checked comments
      .map(comment => comment.id);
  
    try {
      // Update status to true (approved) for selected comments
      await Promise.all(idsToApprove.map(id => 
        axios.put(`http://localhost:3005/comments/${id}`, { status: true })
      ));
      fetchComments(); // Refresh the list of comments after approval
    } catch (error) {
      console.error("Error approving comments:", error);
    }
  };
  

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete these comments?");
    if (!confirmDelete) return;

    const idsToDelete = currentComments
      .filter((_, index) => checkedItems[index])
      .map(comment => comment.id);

    try {
      await axios.delete("http://localhost:3005/comments", { data: { ids: idsToDelete } });
      fetchComments(); // Refresh the comments list
    } catch (error) {
      console.error("Error deleting comments:", error);
    }
  };

  return (
    <Cms activePage="comments">
      <div className="flex">
        <main className="flex-1 p-4">
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <label htmlFor="filter" className="mr-2">Filtered by:</label>
              <select
                id="filter"
                className="bg-gray-100 text-gray-400 p-2 rounded"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">None</option>
                <option value="5">★★★★★</option>
                <option value="4">★★★★</option>
                <option value="3">★★★</option>
                <option value="2">★★</option>
                <option value="1">★</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Search comments"
              className="p-1 rounded-lg bg-gray-100 text-black focus:outline-none w-1/4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Comments Table */}
          <table className="min-w-full bg-gray-800 rounded-xl">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectAll}
                    onChange={() => {
                      setSelectAll(!selectAll);
                      setCheckedItems(currentComments.reduce((acc, _, index) => {
                        acc[index] = !selectAll;
                        return acc;
                      }, {}));
                    }}
                  />
                  Select All
                </th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Drama</th>
                <th className="px-4 py-3">Comments</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentComments.map((comment, index) => (
                <tr key={comment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                  <td className="p-3 text-gray-800">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={checkedItems[index] || false}
                      onChange={() => handleCheckboxChange(index)}
                    />
                  </td>
                  <td className="p-3 text-gray-800">{comment.username}</td>
                  <td className="p-3 text-yellow-400">{renderStars(comment.rate)}</td>
                  <td className="p-3 text-gray-800">{comment.drama}</td>
                  <td className="p-3 text-gray-800">{comment.comment}</td>
                  <td className={`p-3 text-${comment.status ? 'green' : 'red'}-500`}>
                    {comment.status ? "Approved" : "Unapproved"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Actions */}
          <div className="mt-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleApprove}>
              Approve
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={handleDelete}>
              Delete
            </button>
          </div>

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
              disabled={currentPage === totalPages}>{">"}</button>
            <button
              className="p-2 bg-gray-200 text-black rounded-md hover:bg-gray-100 font-bold"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}>{">>"}
            </button>
          </div>
        </main>
      </div>
    </Cms>
  );
};

export default Comments;
