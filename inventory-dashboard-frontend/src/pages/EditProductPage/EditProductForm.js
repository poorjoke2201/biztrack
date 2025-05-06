// src/pages/EditProductPage/EditProductForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Keep navigate for cancel/success
import styles from './EditProductPage.module.css'; // Reuse same module or create specific one
import { updateProduct } from '../../services/productService'; // Only need update function
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';

// Accept productToEdit and categoryList as props
const EditProductForm = ({ productToEdit, categoryList = [] }) => {
  // Initialize state from props
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [currentStockDisplay, setCurrentStockDisplay] = useState('N/A'); // For read-only display
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  // Add date states if needed
  // const [manufactureDate, setManufactureDate] = useState('');
  // const [expiryDate, setExpiryDate] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false); // Only submitting state needed here

  const navigate = useNavigate();
  const productId = productToEdit?._id; // Get ID from the passed prop

  // --- Effect to pre-fill form when productToEdit prop changes ---
  useEffect(() => {
    if (productToEdit) {
      console.log("EditProductForm: Pre-filling form with prop data:", productToEdit);
      setName(productToEdit.name || '');
      setSku(productToEdit.sku || '');
      setDescription(productToEdit.description || '');
      setSelectedCategoryId(productToEdit.category?._id || ''); // Use category ID from prop
      setCostPrice(productToEdit.costPrice != null ? String(productToEdit.costPrice) : '');
      setSellingPrice(productToEdit.sellingPrice != null ? String(productToEdit.sellingPrice) : '');
      setMrp(productToEdit.mrp != null ? String(productToEdit.mrp) : '');
      setCurrentStockDisplay(productToEdit.currentStock != null ? String(productToEdit.currentStock) : 'N/A');
      setLowStockThreshold(productToEdit.lowStockThreshold != null ? String(productToEdit.lowStockThreshold) : '');
      setDiscountPercentage(productToEdit.discountPercentage != null ? String(productToEdit.discountPercentage) : '');
      // Set dates if needed (ensure correct formatting e.g., YYYY-MM-DD for input type="date")
      // setManufactureDate(productToEdit.manufactureDate ? new Date(productToEdit.manufactureDate).toISOString().split('T')[0] : '');
      // setExpiryDate(productToEdit.expiryDate ? new Date(productToEdit.expiryDate).toISOString().split('T')[0] : '');
    }
  }, [productToEdit]); // Re-run only if the product prop changes

  // --- Handle Submit ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!productId) {
        setError("Cannot update product without a valid ID.");
        return;
    }

    // Validation
    if (!name || !sku || !selectedCategoryId || sellingPrice === '') {
      setError('SKU, Product Name, Category, and Selling Price are required.');
      return;
    }
    if (isNaN(parseFloat(sellingPrice))) {
      setError('Please enter a valid number for Selling Price.');
      return;
    }
    // Add more validation...

    setSubmitting(true);
    const productData = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim(),
      categoryId: selectedCategoryId,
      costPrice: costPrice !== '' ? parseFloat(costPrice) : undefined,
      sellingPrice: parseFloat(sellingPrice),
      mrp: mrp !== '' ? parseFloat(mrp) : undefined,
      discountPercentage: discountPercentage !== '' ? parseFloat(discountPercentage) : undefined,
      lowStockThreshold: lowStockThreshold !== '' ? parseInt(lowStockThreshold, 10) : undefined,
      // manufactureDate: manufactureDate || undefined,
      // expiryDate: expiryDate || undefined,
      // DO NOT SEND currentStock
    };

    try {
      const response = await updateProduct(productId, productData);
      setSuccessMessage(`Product '${response.name}' updated successfully!`);
      setError(''); // Clear error on success
      // Optionally update the display stock based on response if backend sends it? Generally no.
      // Or navigate away:
      // setTimeout(() => navigate('/view-inventory'), 1500);
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
      setSuccessMessage(''); // Clear success message on error
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render Form ---
  // No loading state check needed here as parent handles initial load
  if (!productToEdit) {
      // This should technically not happen if the parent page handles errors,
      // but good as a fallback.
      return <Alert type="error" message="Product data not available." />;
  }

  return (
    // Use same container class or a specific one if needed
    <div className={styles.formContainer}> {/* Make sure formContainer style exists */}
      <form onSubmit={handleSubmit} className={styles.editProductForm}> {/* Make sure editProductForm style exists */}
        <h2>Edit Product: {productToEdit?.name}</h2> {/* Display name in title */}
        {error && !submitting && <Alert type="error" message={error} onClose={() => setError('')}/>}
        {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')}/>}

        {/* Read-Only Stock Display */}
        <InputField label="Current Stock (Read-Only)" id="currentStockDisplay" type="text" value={currentStockDisplay} readOnly disabled helpText="Use Stock Adjustment features to change stock levels." />

        {/* Editable Fields */}
        <InputField label="SKU *" id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} required disabled={submitting}/>
        <InputField label="Product Name *" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={submitting}/>
        <InputField label="Description" id="description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} disabled={submitting} rows={3}/>

        {/* Category Dropdown - Uses categoryList from props */}
        <div className={styles.formGroup}> {/* Ensure formGroup style exists */}
          <label htmlFor="category" className={styles.label}>Category *</label> {/* Ensure label style exists */}
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            required
            disabled={submitting || categoryList.length === 0} // Disable if submitting or no categories loaded
            className={styles.selectField} // Ensure selectField style exists
          >
            <option value="" disabled>
                {categoryList.length === 0 ? "Loading Categories..." : "Select a Category"}
            </option>
            {/* Map over categoryList passed as prop */}
            {categoryList.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
           {/* Optional: Show message if list is empty and not loading */}
           {categoryList.length === 0 && !productToEdit && <small>No categories found.</small>}
        </div>

        <InputField label="Cost Price (₹)" id="costPrice" type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} disabled={submitting}/>
        <InputField label="Selling Price (₹) *" id="sellingPrice" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required disabled={submitting}/>
        <InputField label="MRP (₹)" id="mrp" type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} disabled={submitting}/>
        <InputField label="Discount (%)" id="discountPercentage" type="number" min="0" max="100" step="0.01" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} disabled={submitting} placeholder="e.g., 5 or 10.5"/>
        <InputField label="Low Stock Threshold" id="lowStockThreshold" type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} disabled={submitting} placeholder="e.g., 10"/>

        {/* Date Inputs - Uncomment and adjust if needed */}
        {/* <InputField label="Manufacture Date" id="manufactureDate" type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} disabled={submitting} /> */}
        {/* <InputField label="Expiry Date" id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} disabled={submitting} /> */}

        {/* Action Buttons */}
        <div className={styles.buttonGroup}> {/* Ensure buttonGroup style exists */}
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner size="small" /> : 'Update Product'}
          </Button>
          {/* Correct navigation path */}
          <Button type="button" onClick={() => navigate('/view-inventory')} variant="secondary" disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;