// src/services/productService.js
import axios from 'axios';
// Assuming API_BASE_URL is correctly defined (e.g., 'http://localhost:3000')
import { API_BASE_URL } from '../config/constants';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  // Only add header if token exists
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetches all products, optionally filtered by search term or category.
 * Requires authentication.
 * @param {string} [searchTerm] - Optional search term for name/sku.
 * @param {string} [categoryId] - Optional category ID to filter by ('All' means no filter).
 */
export const getAllProducts = async (searchTerm = '', categoryId = 'All') => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    if (categoryId && categoryId !== 'All') {
      params.append('category', categoryId);
    }
    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;

    console.log(`productService: Fetching products with URL: ${url}`);
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('productService: Error fetching products:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches a single product by its ID.
 * Requires authentication.
 * @param {string} productId - The ID of the product.
 */
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products/${productId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error(`productService: Error fetching product ${productId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Creates a new product.
 * Requires admin authentication.
 * @param {object} productData - Data for the new product.
 */
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/products`, productData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('productService: Error creating product:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates an existing product.
 * Requires admin authentication.
 * @param {string} productId - The ID of the product to update.
 * @param {object} productData - Fields to update.
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/products/${productId}`, productData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error(`productService: Error updating product ${productId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a product. (Use with caution)
 * Requires admin authentication.
 * @param {string} productId - The ID of the product to delete.
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/products/${productId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error(`productService: Error deleting product ${productId}:`, error.response?.data || error.message);
    throw error;
  }
};


/**
 * Searches for products by name or SKU using the main GET endpoint.
 * Requires authentication.
 * @param {string} searchTerm - The term to search for.
 */
export const searchProducts = async (searchTerm) => {
  try {
    // *** Use the main GET /api/products endpoint with '?search=' query parameter ***
    const response = await axios.get(`${API_BASE_URL}/api/products?search=${encodeURIComponent(searchTerm)}`, { headers: getAuthHeaders() });
    return response.data || []; // Ensure array return
  } catch (error) {
    console.error(`productService: Error searching products with term "${searchTerm}":`, error.response?.data || error.message);
    return []; // Return empty on error
  }
};


// NOTE: updateProductStock and getProductsByCategory might be redundant
// if stock is handled by stockAdjustmentService and category filtering
// is handled by query params in getAllProducts or frontend filtering.
// Commenting them out for now unless specifically needed by other components.

/*
export const updateProductStock = async (productId, stockChange, operation = 'add') => {
  try {
    console.warn("updateProductStock service function called. Ensure backend endpoint exists: PATCH /api/products/:id/stock");
    const response = await axios.patch(`${API_BASE_URL}/api/products/${productId}/stock`, { stockChange, operation }, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) { console.error(`productService: Error updating stock for product ${productId}:`, error.response?.data || error.message); throw error; }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    console.warn("getProductsByCategory service function called. Ensure backend endpoint exists: GET /api/products/category/:categoryId");
    const response = await axios.get(`${API_BASE_URL}/api/products/category/${categoryId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) { console.error(`productService: Error fetching products for category ${categoryId}:`, error.response?.data || error.message); throw error; }
};
*/