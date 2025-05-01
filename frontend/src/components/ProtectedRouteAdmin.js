import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the token exists in localStorage
  const token = localStorage.getItem('token');

  // If no token is found, redirect to the login page
  if (!token) {
    return <Navigate to="/admin" />;
  }

  // If token exists, render the protected route (children)
  return children;
};

export default ProtectedRoute;
