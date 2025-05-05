/*import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'; // Replace with your backend URL

export const login = async (identifier, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier, // Assuming your backend uses 'identifier' for username/email
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    if (error.response && error.response.data) {
      return error.response.data; // Return backend error message
    }
    throw error; // Re-throw for the component to handle unexpected errors
  }
};

// You might have other auth-related functions here (e.g., logout)

export const signup = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData); // Adjust endpoint
      return response.data;
    } catch (error) {
      console.error('Signup failed:', error);
      return error.response ? error.response.data : { success: false, message: 'Signup failed due to a network error.' };
    }
  };*/

  import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    return error.response ? error.response.data : { success: false, message: 'Login failed due to a network error.' };
  }
};

export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Signup failed:', error);
    return error.response ? error.response.data : { success: false, message: 'Signup failed due to a network error.' };
  }
};