import React, { useState, useEffect } from 'react';
import styles from './AddProductPage.module.css'; // Using page's CSS module
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
// TODO: Import API service functions
// import { addProduct, getUniqueCategories } from '../../services/productService';

const AddProductForm = () => {
  // State for form fields
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [categoryName, setCategoryName] = useState(''); // Will hold selected category
  const [discount, setDiscount] = useState('');
  // Removed productID state
  const [sellingPrice, setSellingPrice] = useState('');
  const [dateOfManufacture, setDateOfManufacture] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [currentStock, setCurrentStock] = useState('');

  // State for category dropdown
  const [categoryList, setCategoryList] = useState([]); // To store fetched categories
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- Fetch Categories on Mount ---
  useEffect(() => {
    const fetchCategories = async () => {
      setIsFetchingCategories(true);
      try {
        // --- TODO: Replace with actual API call ---
        console.log('Fetching unique category names...');
        // const uniqueCategories = await getUniqueCategories(); // Example service call
        // setCategoryList(uniqueCategories || []); // Expecting an array of strings

        // --- Placeholder Data ---
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setCategoryList(['Fruits', 'Bakery', 'Dairy', 'Vegetables', 'Beverages']);
        // --- End Placeholder ---

      } catch (err) {
        console.error("Error fetching categories:", err);
        // Handle error - maybe show a message to the user
        setError('Could not load product categories.');
      } finally {
        setIsFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means run once on mount


  const resetForm = () => {
    setProductName('');
    setExpiryDate('');
    setCategoryName(''); // Reset dropdown selection
    setDiscount('');
    setSellingPrice('');
    setDateOfManufacture('');
    setLowStockThreshold('');
    setCostPrice('');
    setMrp('');
    setCurrentStock('');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!categoryName) {
        setError('Please select a category.');
        setLoading(false);
        return;
    }
    // Add other validations as needed...

    // Prepare data payload for backend
    const productData = {
      name: productName,
      categoryName: categoryName, // Send selected category
      description: '', // Add description field if needed
      purchasePrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      quantityInStock: parseInt(currentStock, 10) || 0,
      expiryDate: expiryDate || null,
      dateOfManufacture: dateOfManufacture || null,
      discountPercentage: parseFloat(discount) || 0,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 0,
      mrp: parseFloat(mrp) || null,
      // No productID/SKU sent from here unless you have a field for it
    };

    try {
      // --- TODO: Replace with actual API call ---
      console.log('Submitting Product Data:', productData);
      // const response = await addProduct(productData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // --- End API Call Placeholder ---

      setSuccess('Product added successfully!');
      resetForm();
    } catch (err) {
      console.error("Add Product Error:", err);
      setError(err.response?.data?.message || err.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.addProductForm}>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Use grid for layout - all fields included for uniformity */}
      <div className={styles.formGrid}>
        {/* Row 1 */}
        <InputField
          label="Product Name"
          id="productName"
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
          disabled={loading}
          className={styles.gridItem} // Add class if needed for grid styling
        />
        {/* Category Dropdown */}
        <div className={styles.formGroup}> {/* Wrap select in formGroup for label */}
            <label htmlFor="categoryName" className={styles.label}>Category</label>
            <select
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                disabled={loading || isFetchingCategories}
                className={`${styles.inputField} ${styles.selectField}`} // Reuse input style + select specific style
            >
                <option value="" disabled>
                    {isFetchingCategories ? 'Loading...' : '-- Select Category --'}
                </option>
                {categoryList.map((cat) => (
                    <option key={cat} value={cat}>
                    {cat}
                    </option>
                ))}
            </select>
        </div>

        {/* Row 2 */}
        <InputField
          label="Cost Price (₹)"
          id="costPrice"
          type="number"
          min="0"
          step="0.01"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          required
          disabled={loading}
          className={styles.gridItem}
        />
        <InputField
          label="Selling Price (₹)"
          id="sellingPrice"
          type="number"
          min="0"
          step="0.01"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          required
          disabled={loading}
          className={styles.gridItem}
        />


        {/* Row 3 */}
         <InputField
            label="Max Retail Price (MRP ₹)"
            id="mrp"
            type="number"
            min="0"
            step="0.01"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            disabled={loading}
            className={styles.gridItem}
          />
          <InputField
            label="Discount (%)"
            id="discount"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            disabled={loading}
            placeholder="e.g., 5 or 10.5"
            className={styles.gridItem}
         />


        {/* Row 4 */}
        <InputField
            label="Current Stock (Units)"
            id="currentStock"
            type="number"
            min="0"
            step="1"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
            required
            disabled={loading}
            className={styles.gridItem}
          />
         <InputField
            label="Low Stock Threshold"
            id="lowStockThreshold"
            type="number"
            min="0"
            step="1"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            disabled={loading}
            placeholder="e.g., 10"
            className={styles.gridItem}
         />

        {/* Row 5 */}
        <InputField
          label="Date of Manufacture"
          id="dateOfManufacture"
          type="date"
          value={dateOfManufacture}
          onChange={(e) => setDateOfManufacture(e.target.value)}
          disabled={loading}
          className={styles.gridItem}
        />
        <InputField
          label="Expiry Date"
          id="expiryDate"
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          disabled={loading}
          className={styles.gridItem}
        />

        {/* Product ID field REMOVED */}

      </div> {/* End Form Grid */}


      {/* Submit Button Container */}
      <div className={styles.submitButtonContainer}>
        <Button type="submit" disabled={loading || isFetchingCategories} variant="primary" size="large">
          {loading ? <Spinner size="small" /> : 'Add Product Stock'}
        </Button>
      </div>

    </form>
  );
};

export default AddProductForm;