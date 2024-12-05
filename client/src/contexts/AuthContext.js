// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [role, setRole] = useState(null);

//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         const savedRole = localStorage.getItem("role");
//         if (token) {
//             setIsAuthenticated(true);
//             setRole(savedRole);
//         }
//     }, []);

//     const login = (userRole) => {
//         setIsAuthenticated(true);
//         setRole(userRole);
//         localStorage.setItem("role", userRole);
//     };

//     const logout = () => {
//         setIsAuthenticated(false);
//         setRole(null);
//         localStorage.removeItem("token");
//         localStorage.removeItem("role");
//     };

//     return (
//         <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);
