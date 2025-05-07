// src/pages/ProductInfoPage/ProductInfoPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './ProductInfoPage.module.css';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { getProductById } from '../../services/productService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const ProductInfoPage = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await getProductById(productId);
        console.log('Fetched product data:', data);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Failed to load product information');
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [productId]);
  
  const handleBackToInventory = () => {
    navigate('/view-inventory');
  };

  if (loading) return <div className={styles.productInfoPage}><Spinner message="Loading product information..." /></div>;
  if (error) return <div className={styles.productInfoPage}><Alert type="error" message={error} /></div>;
  if (!product) return <div className={styles.productInfoPage}><Alert type="warning" message="Product not found" /></div>;
  
  return (
    <div className={styles.productInfoPage}>
      <div className={styles.header}>
        <h1>{product.name}</h1>
        <div className={styles.headerActions}>
          <Button onClick={handleBackToInventory} variant="secondary">Back to Inventory</Button>
          {user?.role === 'admin' && (
            <Button onClick={() => navigate(`/edit-product/${product._id}`)}>
              Edit Product
            </Button>
          )}
        </div>
      </div>
      
      <div className={styles.productContent}>
        <div className={styles.mainInfo}>
          <div className={styles.infoCard}>
            <h2>Product Details</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>SKU:</span>
                <span className={styles.value}>{product.sku}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Category:</span>
                <span className={styles.value}>{product.category?.name || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Selling Price:</span>
                <span className={styles.value}>{formatCurrency(product.sellingPrice)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Cost Price:</span>
                <span className={styles.value}>{user?.role === 'admin' ? formatCurrency(product.costPrice) : 'Admin Only'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Current Stock:</span>
                <span className={`${styles.value} ${
                  product.currentStock <= 0 ? styles.outOfStock : 
                  product.currentStock <= product.lowStockThreshold ? styles.lowStock : ''
                }`}>
                  {product.currentStock}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Low Stock Threshold:</span>
                <span className={styles.value}>{product.lowStockThreshold}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Created At:</span>
                <span className={styles.value}>{formatDate(product.createdAt)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Last Updated:</span>
                <span className={styles.value}>{formatDate(product.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          {product.description && (
            <div className={styles.infoCard}>
              <h2>Description</h2>
              <p className={styles.description}>{product.description}</p>
            </div>
          )}
        </div>
        
        <div className={styles.sideInfo}>
          <div className={styles.infoCard}>
            <h2>Inventory Status</h2>
            <div className={`${styles.statusIndicator} ${
              product.currentStock <= 0 ? styles.outOfStockIndicator : 
              product.currentStock <= product.lowStockThreshold ? styles.lowStockIndicator : 
              styles.inStockIndicator
            }`}>
              {product.currentStock <= 0 ? 'Out of Stock' : 
               product.currentStock <= product.lowStockThreshold ? 'Low Stock' : 
               'In Stock'}
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className={styles.infoCard}>
              <h2>Admin Actions</h2>
              <div className={styles.adminActions}>
                <Button 
                  onClick={() => navigate(`/edit-product/${product._id}`)}
                  fullWidth
                >
                  Edit Product
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfoPage;