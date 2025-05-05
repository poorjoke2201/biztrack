import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

// --- Add Product ---
export const addProduct = async (productData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/api/products`, productData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Return created product object
  } catch (error) {
    console.error('Error adding product:', error);
    // Re-throw error to be handled by the component, includes response data if available
    throw error;
  }
};

// --- Get All Products ---
export const getAllProducts = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Return array of products
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};

// --- Get Single Product By ID ---
export const getProductById = async (productId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Return single product object
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    throw error;
  }
};

// --- Update Product ---
export const updateProduct = async (productId, productData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/api/products/${productId}`, productData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Return updated product object
  } catch (error) {
    console.error(`Error updating product with ID ${productId}:`, error);
    throw error;
  }
};

// --- Delete Product ---
export const deleteProduct = async (productId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Backend sends { message: 'Product removed' } on success
    return response.data;
  } catch (error) {
    console.error(`Error deleting product with ID ${productId}:`, error);
    throw error;
  }
};

// --- Get Low Stock Products ---
export const getLowStockProducts = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/api/products/lowstock`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Return array of low stock products
  } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
  }
};

// --- Get Unique Product Categories ---
export const getProductCategories = async () => {
  try {
    const token = localStorage.getItem('authToken');
    // Match the backend route path
    const response = await axios.get(`${API_BASE_URL}/api/products/utils/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Should be an array of strings
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw error; // Re-throw for component handling
  }
};