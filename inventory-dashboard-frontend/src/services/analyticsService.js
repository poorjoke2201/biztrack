import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const getDashboardData = async () => {
  try {
    const token = localStorage.getItem('authToken'); // Assuming you store the token after login
    const response = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, { // Adjust the endpoint as needed
      headers: {
        Authorization: `Bearer ${token}`, // Include authorization if your backend requires it
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export const getSalesData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/api/analytics/sales`, { // Adjust the endpoint
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales data:', error);
      throw error;
    }
  };
  
  // You might have other analytics-related data fetching functions
  