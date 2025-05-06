// src/services/analyticsService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetches summary data for the main dashboard.
 */
export const getDashboardSummary = async () => {
  try {
    // Calling the correct backend endpoint
    const response = await axios.get(`${API_BASE_URL}/analytics/dashboard-summary`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary data:', error);
    throw error; // Re-throw for component handling
  }
};

/**
 * Fetches sales trend data (e.g., grouped by month).
 */
export const getSalesTrend = async () => {
  try {
     // Calling the correct backend endpoint
    const response = await axios.get(`${API_BASE_URL}/analytics/sales-trend`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales trend data:', error);
    throw error;
  }
};

/**
 * Fetches data for the detailed analytics page.
 */
export const getAnalyticsDetails = async () => {
  try {
     // Calling the correct backend endpoint
    const response = await axios.get(`${API_BASE_URL}/analytics/details`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed analytics data:', error);
    throw error;
  }
};


/**
 * Fetches low stock prediction for a specific product.
 * @param {string} productId - The ID of the product.
 */
export const getLowStockPrediction = async (productId) => {
  try {
     // Calling the correct backend endpoint
    const response = await axios.get(`${API_BASE_URL}/analytics/low-stock-prediction/${productId}`, { headers: getAuthHeaders() });
    return response.data; // Expects { message, predictionDate, daysLeft, averageDailySales }
  } catch (error) {
    console.error(`Error fetching low stock prediction for ${productId}:`, error);
    throw error;
  }
};

// Add other analytics functions if new endpoints are created