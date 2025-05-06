// src/pages/EditProductPage/EditProductPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditProductPage.module.css';
import EditProductForm from './EditProductForm'; // Import the form component
import { getProductById } from '../../services/productService'; // Service for fetching
import { getAllCategories } from '../../services/categoryService'; // Fetch categories here too
import Spinner from '../../components/Spinner/Spinner'; // Assuming path
import Alert from '../../components/Alert/Alert'; // Assuming path
import Button from '../../components/Button/Button'; // For Back button

const EditProductPage = () => {
  const { productId } = useParams(); // Get the product ID from the route params
  const [product, setProduct] = useState(null); // Store fetched product data
  const [categories, setCategories] = useState([]); // Store fetched categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!productId) {
        setError("No product ID specified.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
         // Fetch product and categories required by the form
        const [productData, categoriesData] = await Promise.all([
          getProductById(productId),
          getAllCategories() // Fetch categories needed for the dropdown
        ]);

        if (isMounted) {
            if (productData) {
                setProduct(productData);
            } else {
                setError(`Product with ID ${productId} not found.`);
            }
            setCategories(categoriesData || []);
        }
      } catch (err) {
        if (isMounted) {
            console.error('Error fetching data for edit page:', err);
            setError(err.response?.data?.message || 'Failed to load product details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; }; // Cleanup
  }, [productId]); // Re-fetch if ID changes

  if (loading) {
    return (
      <div className={styles.editProductPage}>
        <h2>Edit Product</h2>
        <Spinner message="Loading product details..." />
      </div>
    );
  }

  // If error occurred during fetch OR product wasn't found
  if (error || !product) {
    return (
      <div className={styles.editProductPage}>
        <h2>Edit Product</h2>
        <Alert type="error" message={error || `Product with ID ${productId} not found.`} />
        {/* Use Button component */}
        <Button onClick={() => navigate('/inventory')} variant="secondary" style={{marginTop: '1rem'}}>
            Back to Inventory
        </Button>
      </div>
    );
  }

  // Render the Form component, passing fetched data as props
  return (
    <div className={styles.editProductPage}>
      {/* Title is now inside the form component */}
      {/* Pass product and categories data down */}
      <EditProductForm productToEdit={product} categoryList={categories} />
    </div>
  );
};

export default EditProductPage;