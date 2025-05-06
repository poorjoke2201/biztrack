// src/services/productService.js
// ** RENAME your inventoryService.js to this file **
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetches all products.
 */
export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`, { headers: getAuthHeaders() });
    return response.data; // Expects array of products with populated category
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error; // Re-throw for component handling
  }
};

/**
 * Fetches a single product by its ID.
 * @param {string} productId - The MongoDB ObjectId of the product.
 */
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`, { headers: getAuthHeaders() });
    return response.data; // Expects single product object with populated category
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    throw error;
  }
};

/**
 * Creates a new product.
 * @param {object} productData - Data for the new product (matching backend model: sku, name, categoryId, etc.)
 */
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/products`, productData, { headers: getAuthHeaders() });
    return response.data; // Return created product object
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

/**
 * Updates an existing product.
 * @param {string} productId - The ID of the product to update.
 * @param {object} productData - Fields to update.
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData, { headers: getAuthHeaders() });
    return response.data; // Return updated product object
  } catch (error) {
    console.error(`Error updating product with ID ${productId}:`, error);
    throw error;
  }
};

/**
 * Deletes a product. (Use with caution)
 * @param {string} productId - The ID of the product to delete.
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/products/${productId}`, { headers: getAuthHeaders() });
    return response.data; // Expects { message: 'Product removed' }
  } catch (error) {
    console.error(`Error deleting product with ID ${productId}:`, error);
    throw error;
  }
};

/**
 * Fetches products that are at or below their low stock threshold.
 */
export const getLowStockProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/lowstock`, { headers: getAuthHeaders() });
    return response.data; // Return array of low stock products
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
};

/**
 * Searches for products by name or SKU (Requires Backend Support).
 * @param {string} searchTerm - The term to search for.
 */
export const searchProducts = async (searchTerm) => {
  try {
    // NOTE: Assumes backend has a search endpoint like GET /api/products?search=term
    // If not, you might need to fetch all and filter client-side (less efficient).
    const response = await axios.get(`${API_BASE_URL}/products?search=${encodeURIComponent(searchTerm)}`, { headers: getAuthHeaders() });
     if (!response.data) {
         console.warn(`Search for "${searchTerm}" returned no data or endpoint might be missing.`);
         return []; // Return empty array if no data
     }
    return response.data;
  } catch (error) {
    console.error(`Error searching products for term "${searchTerm}":`, error);
    // Don't throw necessarily, maybe return empty array on search error
    return [];
    // throw error; // Or re-throw if you want the component to handle search errors explicitly
  }
};