import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const generateNewInvoice = async (invoiceData) => {
  // NOTE: Uses existing 'POST /api/invoices' route.
  try {
    const token = localStorage.getItem('authToken');
    // Path: /api/invoices - CORRECT
    const response = await axios.post(`${API_BASE_URL}/api/invoices`, invoiceData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error generating invoice:', error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error; // Re-throw for component error handling
  }
};

export const getAllInvoices = async () => {
  // NOTE: Uses existing 'GET /api/invoices' route.
  try {
    const token = localStorage.getItem('authToken');
     // Path: /api/invoices - CORRECT
    const response = await axios.get(`${API_BASE_URL}/api/invoices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all invoices:', error);
    throw error; // Re-throw for component error handling
  }
};

// Added function for existing backend route
export const getInvoiceById = async (invoiceId) => {
  // NOTE: Uses existing 'GET /api/invoices/:id' route.
  try {
    const token = localStorage.getItem('authToken');
    // Path: /api/invoices/:id - CORRECT
    const response = await axios.get(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
      console.error(`Error fetching invoice with ID ${invoiceId}:`, error);
      throw error; // Re-throw for component error handling
  }
};