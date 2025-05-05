import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
//import MainLayout from '../../layouts/MainLayout/MainLayout';
import EditProductForm from './EditProductForm';
import styles from './EditProductPage.module.css';
import { getProductById } from '../../services/inventoryService'; // Assuming you have this service

const EditProductPage = () => {
  const { id } = useParams(); // Get the product ID from the route params
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(id);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details.');
        setLoading(false);
        console.error('Error fetching product:', err);
        // Optionally redirect to view inventory page if product not found
        // navigate('/view-inventory');
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      //<MainLayout>
        <div className={styles.editProductPage}>
          <h2>Edit Product</h2>
          <p>Loading product details...</p>
        </div>
      //</MainLayout>
    );
  }

  if (error) {
    return (
      //<MainLayout>
        <div className={styles.editProductPage}>
          <h2>Edit Product</h2>
          <p className={styles.error}>{error}</p>
          <button onClick={() => navigate('/view-inventory')}>Back to Inventory</button>
        </div>
      //</MainLayout>
    );
  }

  return (
    //<MainLayout>
      <div className={styles.editProductPage}>
        <h2>Edit Product</h2>
        {product && <EditProductForm initialProduct={product} />}
      </div>
    //</MainLayout>
  );
};

export default EditProductPage;