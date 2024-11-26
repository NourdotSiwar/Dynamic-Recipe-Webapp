import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/authContext/context';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Maybe render a loading spinner or placeholder?
    return <div>Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;