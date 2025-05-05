import React from 'react'; // Removed useContext as useAuth handles it
import { Navigate } from 'react-router-dom';
// Import the custom hook instead of the context directly
import { useAuth } from '../context/AuthContext'; // Ensure path is correct

const PrivateRoute = ({ children }) => {
  // Use the custom hook to get context values
  const { isAuthenticated, loading } = useAuth();

  console.log("PrivateRoute Check: loading =", loading, "isAuthenticated =", isAuthenticated); // Debug log

  // 1. Handle the loading state from AuthContext
  // Wait until the initial authentication check is complete
  if (loading) {
    // Optional: Show a loading spinner or a blank screen while checking auth
    return <div>Loading authentication...</div>; // Or return null, or a Spinner component
  }

  // 2. Once loading is false, check authentication
  // Render the children (the protected page) if authenticated
  // Otherwise, redirect the user to the login page
  return isAuthenticated ? children : <Navigate to="/login" replace />; // Added 'replace' for better history handling
};

export default PrivateRoute;