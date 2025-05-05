/*import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as authServiceLogin } from '../services/authService'; // Import your login service

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token on initial load and set isAuthenticated accordingly
    const token = localStorage.getItem('authToken');
    if (token) {
      // You might want to validate the token here by making an API call
      setIsAuthenticated(true);
      // Optionally fetch user data based on the token and setUser
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authServiceLogin({ email, password }); // Call your login service
      if (response?.token) {
        localStorage.setItem('authToken', response.token);
        setIsAuthenticated(true);
        setUser({ email: response.email, name: response.name, role: response.role, _id: response._id }); // Set user data
        navigate('/dashboard'); // Redirect to dashboard on successful login
        return true; // Indicate success
      } else if (response?.message) {
        // Handle login error messages from the backend
        return response.message;
      } else {
        return 'Login failed.';
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      return 'Login failed due to a network error.';
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};*/

import React, { createContext, useState, useEffect, useContext } from 'react';
// Keep useNavigate here ONLY if logout needs it, otherwise remove it
import { useNavigate } from 'react-router-dom';
import { login as authServiceLogin } from '../services/authService'; // Ensure path is correct

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  // Keep navigate for logout redirection
  const navigate = useNavigate();

  useEffect(() => {
    // ... (useEffect logic remains the same) ...
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log("AuthContext: Token found on initial load. Setting isAuthenticated.");
      setIsAuthenticated(true);
      // TODO: Fetch user details based on token here and setUser
    }
    setLoading(false);
  }, []);

  // --- MODIFIED LOGIN FUNCTION ---
  const login = async (email, password) => {
    try {
      const response = await authServiceLogin({ email, password });
      if (response?.token) {
        // 1. Update storage
        localStorage.setItem('authToken', response.token);
        // 2. Update state
        setIsAuthenticated(true);
        setUser({ email: response.email, name: response.name, role: response.role, _id: response._id });
        // 3. Return success (navigation happens in the component calling login)
        return { success: true, user: { email: response.email, name: response.name, role: response.role, _id: response._id } };
      } else {
        // Handle specific error messages from backend if provided
        return { success: false, message: response?.message || 'Invalid credentials.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Ensure state is cleared on error
      setIsAuthenticated(false);
      setUser(null);
      // Provide a generic error message or specific one based on error type
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };
  // --- END OF MODIFIED LOGIN FUNCTION ---


  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login'); // Logout can still navigate directly
  };

  const value = {
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated, // Keep if needed elsewhere
      login,
      logout,
      loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};