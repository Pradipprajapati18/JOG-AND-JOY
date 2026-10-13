import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user?.role?.toUpperCase() !== 'ADMIN') {
    // If a non-admin user tries to access admin routes
    return <Navigate to="/" replace />;
  }

  // If not authenticated, let AdminLayout handle showing the login screen.
  // If authenticated and is an admin, let them through.
  return <Outlet />;
};

export default AdminRoute;
