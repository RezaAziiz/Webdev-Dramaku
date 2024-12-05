import React from 'react';
import Navbar from '../components/navbar';
import { Outlet } from 'react-router-dom';

const base = ({ children }) => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <main className="p-2"><Outlet/></main>
    </div>
  );
};

export default base;
