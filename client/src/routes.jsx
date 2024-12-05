import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Base from './components/base';
import Home from './views/home';
import SearchResult from './views/searchResult';
import Detail from './views/detail';
import Login from './views/login';
import Register from './views/register';
import Actors from './views/cmsActors';
import Countries from './views/cmsCountries';
import CmsAwards from './views/cmsAwards';
import Users from './views/cmsUsers';
import Comments from './views/cmsComments';
import DramaList from './views/cmsDrama';
import DramaInput from './views/cmsDramaInput';
import Genres from './views/cmsGenres';
import FilteredMovies from './views/filteredMovies';
import NotFound from './views/NotFound';
import Watchlist from './views/watchlist';


import ProtectedRoute from './protectedRoutes/ProtectedRoute';


const AppRoutes = ({ isAuthenticated, handleLogout }) => {
    return (
        <Routes>
            <Route path="/" element={<Base />}>
                <Route index element={<Home />} />
                <Route path="search" element={<SearchResult />} />
                <Route path="movies/:id" element={<Detail />} />
                <Route path="filtered-movies" element={<FilteredMovies />} /> 
                <Route path="watchlist/:username" element={<Watchlist />} />
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="/notfound" element={< NotFound/>} />

            {/* Protected routes group */}
            <Route path="/actors" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Actors handleLogout={handleLogout} />
                </ProtectedRoute>
            } />
            <Route path="/countries" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Countries />
                </ProtectedRoute>
            } />
            <Route path="/awards" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <CmsAwards />
                </ProtectedRoute>
            } />
            <Route path="/comments" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Comments />
                </ProtectedRoute>
            } />
            <Route path="/genres" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Genres />
                </ProtectedRoute>
            } />
            <Route path="/drama" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <DramaList />
                </ProtectedRoute>
            } />
            <Route path="/dramaInput" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <DramaInput />
                </ProtectedRoute>
            } />
            <Route path="/users" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Users />
                </ProtectedRoute>
            } />
        </Routes>
    );
};

export default AppRoutes;
