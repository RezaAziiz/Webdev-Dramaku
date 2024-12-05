import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true); // Update state jika token ada di localStorage
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('id_user');
        setIsAuthenticated(false);
    };

    return (
        <BrowserRouter>
            <AppRoutes
                isAuthenticated={isAuthenticated}
                handleLogout={handleLogout}
            />
        </BrowserRouter>
    );
}

export default App;
