import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Assuming you have an AuthContext

const useAuth = () => {
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  // Example function to check if a token exists
  const checkAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (token && !isAuthenticated) {
      setIsAuthenticated(true);
      // Optionally fetch user data based on the token
      // setUser(/* user data */);
    } else if (!token && isAuthenticated) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthToken();
    // Optionally set up event listeners for login/logout events
  }, [isAuthenticated, setIsAuthenticated, setUser]);

  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    // Optionally redirect the user
  };

  return { user, isAuthenticated, login, logout };
};

export default useAuth;