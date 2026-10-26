// src/components/Sidebar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import logo from "../assets/logo.png";
import { useAuth } from "../contexts/AuthContext";
import { USER_ROLES } from "../constants/auth";

const Sidebar = () => {
  const location = useLocation(); // Get the current route location
  const navigate = useNavigate(); // Use useNavigate for navigation
  const { role: userRole } = useAuth();

  // Define an activeClass function
  const activeClass = (path) =>
    location.pathname === path ? "bg-gray-400" : "";

  // Function to handle navigation when clicking on list items
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogoClick = () => {
    navigate("/"); // Navigate to home page when logo is clicked
  };

  return (
    <aside className="w-64 bg-gray-800 p-4 h-screen fixed pt-4">
      <div
        className="text-xl font-bold flex items-center"
        onClick={handleLogoClick}
      >
        <img src={logo} alt="Logo" className="w-40 h-10 mr-2 cursor-pointer" />
      </div>
      <ul className="space-y-2 mt-5">
        {userRole !== USER_ROLES.WRITER && (
          <li
            className={`py-2 pl-4 text-gray-100 font-bold cursor-pointer hover:bg-gray-500 rounded-lg active:bg-gray-700 ${activeClass("/users")}`}
            onClick={() => handleNavigation("/users")}
          >
            Users
          </li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
