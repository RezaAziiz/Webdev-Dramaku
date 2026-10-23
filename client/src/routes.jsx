import React from "react";
import { Routes, Route } from "react-router-dom";
import Base from "./components/base";
import Home from "./views/home";
import SearchResult from "./views/searchResult";
import Detail from "./views/detail";
import Login from "./views/login";
import Register from "./views/register";
import Actors from "./views/cmsActors";
import Countries from "./views/cmsCountries";
import CmsAwards from "./views/cmsAwards";
import Users from "./views/cmsUsers";
import Comments from "./views/cmsComments";
import DramaList from "./views/cmsDrama";
import DramaInput from "./views/cmsDramaInput";
import Genres from "./views/cmsGenres";
import FilteredMovies from "./views/filteredMovies";
import NotFound from "./views/NotFound";
import Watchlist from "./views/watchlist";
import ProtectedRoute from "./protectedRoutes/ProtectedRoute";
import { USER_ROLES } from "./constants/auth";

const AppRoutes = () => {
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
      <Route path="/notfound" element={<NotFound />} />

      {/* Protected routes group */}
      <Route
        path="/actors"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <Actors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/countries"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <Countries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/awards"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <CmsAwards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comments"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <Comments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/genres"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <Genres />
          </ProtectedRoute>
        }
      />
      <Route
        path="/drama"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <DramaList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dramaInput"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.WRITER]}>
            <DramaInput />
          </ProtectedRoute>
        }
      />
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
