// src/services/productService.js
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Get all products
export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};


// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/products`, productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    throw error;
  }
};

// Update product stock
export const updateProductStock = async (productId, stockChange, operation = 'add') => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/products/${productId}/stock`, {
      stockChange,
      operation // 'add', 'subtract', 'set'
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};

// Search products
export const searchProducts = async (searchTerm) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products/search?term=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching products with term "${searchTerm}":`, error);
    throw error;
  }
};