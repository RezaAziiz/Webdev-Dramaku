import React from "react";
import { Routes, Route } from "react-router-dom";
import Base from "./components/base";
import Home from "./views/home";
import SearchResult from "./views/searchResult";
import Detail from "./views/detail";
import Login from "./views/login";
import Register from "./views/register";
import Users from "./views/cmsUsers";
import FilteredMovies from "./views/filteredMovies";
import NotFound from "./views/NotFound";
import Watchlist from "./views/watchlist";
import Watch from "./views/watch";
import ProtectedRoute from "./protectedRoutes/ProtectedRoute";
import { USER_ROLES } from "./constants/auth";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Base />}>
        <Route index element={<Home />} />
        <Route path="search" element={<SearchResult />} />
        <Route path="movies/:mediaType/:id" element={<Detail />} />
        <Route path="watch/:mediaType/:id" element={<Watch />} />
        <Route path="filtered-movies" element={<FilteredMovies />} />
        <Route path="watchlist/:username" element={<Watchlist />} />
      </Route>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="/notfound" element={<NotFound />} />

      {/* Protected routes group */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <Users />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
