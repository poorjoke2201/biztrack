import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import styles from './EditProductPage.module.css'; // Use the same CSS module or create a specific one
// Import necessary service functions
import { updateProduct, getProductCategories } from '../../services/inventoryService';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';

// Receive initialProduct as prop
const EditProductForm = ({ initialProduct }) => {
  // --- State variables aligned with backend model fields ---
  const [name, setName] = useState('');
  const [categoryInput, setCategoryInput] = useState(''); // For the category input/datalist
  const [categoryList, setCategoryList] = useState([]); // For existing categories
  const [cost_price, setCostPrice] = useState('');
  const [selling_price, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  // Optional: Add state for discount, mfd, expiryDate if needed

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for submit
  const [loadingCategories, setLoadingCategories] = useState(false); // Loading state for categories

  const navigate = useNavigate();
  const { id: productId } = useParams(); // Get productId directly from URL params

  // --- Fetch Categories ---
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const fetchedCategories = await getProductCategories();
        if (isMounted && Array.isArray(fetchedCategories)) {
          setCategoryList(fetchedCategories);
        }
      } catch (catError) {
        console.error("Failed to load categories", catError);
        // Optionally set an error state if category loading fails
      } finally {
         if (isMounted) setLoadingCategories(false);
      }
    };
    fetchCategories();
    return () => { isMounted = false; } // Cleanup
  }, []); // Run once on mount

  // --- Pre-fill Form when initialProduct data is available ---
  useEffect(() => {
    if (initialProduct) {
      console.log("Pre-filling form with:", initialProduct); // Debug log
      setName(initialProduct.name || '');
      setCategoryInput(initialProduct.category || ''); // Use categoryInput state
      // Convert numbers to strings for input fields, handle null/undefined
      setCostPrice(initialProduct.cost_price != null ? String(initialProduct.cost_price) : '');
      setSellingPrice(initialProduct.selling_price != null ? String(initialProduct.selling_price) : '');
      setMrp(initialProduct.mrp != null ? String(initialProduct.mrp) : '');
      setStock(initialProduct.stock != null ? String(initialProduct.stock) : '');
      setLowStockThreshold(initialProduct.lowStockThreshold != null ? String(initialProduct.lowStockThreshold) : '');
      // Set other fields if applicable (discount, mfd, expiryDate)
    }
  }, [initialProduct]); // Re-run if initialProduct changes

  // --- Handle Submit ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    // Basic Frontend Validation
    if (!name || !selling_price || !stock) {
        setError('Product Name, Selling Price, and Stock are required.');
        return;
    }
     if (isNaN(parseFloat(selling_price)) || isNaN(parseInt(stock, 10))) {
         setError('Please enter valid numbers for prices and stock.');
         return;
     }

    setLoading(true);

    try {
      // --- Construct data object for UPDATE ---
      // Only include fields that are actually managed by the form state
      const productData = {
        name,
        category: categoryInput.trim() || undefined, // Use trimmed input or undefined
        cost_price: cost_price !== '' ? parseFloat(cost_price) : undefined,
        selling_price: parseFloat(selling_price), // Required
        mrp: mrp !== '' ? parseFloat(mrp) : undefined,
        stock: parseInt(stock, 10), // Required
        lowStockThreshold: lowStockThreshold !== '' ? parseInt(lowStockThreshold, 10) : undefined,
        // Add other fields if managed by state (discount, mfd, expiryDate)
      };

      console.log(`Sending update data for product ${productId}:`, productData);

      // --- Correct call to updateProduct service ---
      const response = await updateProduct(productId, productData);
      setLoading(false);

      // --- Correct Success Check (backend returns updated object) ---
      if (response && response._id) {
        setSuccessMessage(`Product '${response.name}' updated successfully!`);
        // Redirect back to inventory list after a short delay
        setTimeout(() => navigate('/view-inventory'), 1500);
      } else {
        // Use error message from response if available
        setError(response?.message || 'Failed to update product. Unexpected response.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || err.message || 'An unexpected network or server error occurred.');
    }
  };

  // --- Render Form ---
  return (
    // Use EditProductPage.module.css or a shared form style
    <form onSubmit={handleSubmit} className={styles.editProductForm}>
      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Input Fields (similar to AddProductForm, but bound to edit state) */}
      <div className={styles.formGroup}>
        <label htmlFor="name">Product Name *</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      {/* Category Input with Datalist */}
      <div className={styles.formGroup}>
        <label htmlFor="category-input">Category</label>
        <input
          type="text"
          id="category-input"
          list="category-list"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          placeholder={loadingCategories ? "Loading categories..." : "Type or select category"}
          disabled={loadingCategories}
        />
        <datalist id="category-list">
          {categoryList.map((cat, index) => (
            <option key={index} value={cat} />
          ))}
        </datalist>
      </div>

      {/* Cost Price */}
       <div className={styles.formGroup}>
        <label htmlFor="cost_price">Cost Price</label>
        <input type="number" id="cost_price" step="0.01" value={cost_price} onChange={(e) => setCostPrice(e.target.value)} />
      </div>
      {/* Selling Price */}
      <div className={styles.formGroup}>
        <label htmlFor="selling_price">Selling Price *</label>
        <input type="number" id="selling_price" step="0.01" value={selling_price} onChange={(e) => setSellingPrice(e.target.value)} required />
      </div>
      {/* MRP */}
       <div className={styles.formGroup}>
        <label htmlFor="mrp">MRP</label>
        <input type="number" id="mrp" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} />
      </div>
      {/* Stock Quantity */}
      <div className={styles.formGroup}>
        <label htmlFor="stock">Stock Quantity *</label>
        <input type="number" id="stock" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required />
      </div>
      {/* Low Stock Threshold */}
       <div className={styles.formGroup}>
        <label htmlFor="lowStockThreshold">Low Stock Threshold</label>
        <input type="number" id="lowStockThreshold" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
      </div>

      {/* Add inputs for discount, mfd, expiryDate if needed */}

      <button type="submit" disabled={loading || loadingCategories}>
        {loading ? <Spinner size="small" /> : 'Update Product'}
      </button>
      {/* Optional: Cancel button */}
      <button type="button" onClick={() => navigate('/view-inventory')} className={styles.cancelButton} disabled={loading}>
        Cancel
      </button>
    </form>
  );
};

export default EditProductForm;