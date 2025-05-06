// src/pages/AddProductPage/AddProductForm.js
import React, { useState, useEffect } from 'react';
import styles from './AddProductPage.module.css'; // Use page's CSS module
import InputField from '../../components/InputField/InputField'; // Use InputField
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
// --- Import ACTUAL API service functions ---
import { createProduct } from '../../services/productService'; // Renamed from inventoryService
import { getAllCategories } from '../../services/categoryService'; // Service for categories
import { createStockAdjustment } from '../../services/stockAdjustmentService'; // For initial stock
import { useAuth } from '../../hooks/useAuth'; // To get user ID for stock adjustment

// *** Accept the key prop passed from AddProductPage ***
const AddProductForm = ({ key: categoryUpdateKey }) => { // Rename key prop if needed, just accept it
  // State aligned with backend Product model + UI needs
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // Store category ID
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // State for category dropdown
  const [categoryList, setCategoryList] = useState([]); // Stores fetched categories [{_id, name}]
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);

  // State for UI feedback
  const [loading, setLoading] = useState(false); // For form submission
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth(); // Get current user for stock adjustment record

  // --- Fetch Categories on Mount AND when categoryUpdateKey changes ---
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setIsFetchingCategories(true);
      // Don't clear main form error when just refetching categories,
      // but maybe clear a specific category loading error if you had one.
      // setError('');
      try {
        console.log('Fetching categories for AddProductForm (Effect Triggered)...');
        const fetchedCategories = await getAllCategories();
        if (isMounted) {
          setCategoryList(fetchedCategories || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        if (isMounted) setError('Could not load product categories. Please try refreshing or add one via Manage Categories.');
      } finally {
        if (isMounted) setIsFetchingCategories(false);
      }
    };

    fetchCategories();
    return () => { isMounted = false }; // Cleanup
  }, [categoryUpdateKey]); // <-- Add categoryUpdateKey dependency to refetch

  // --- Reset Form ---
  const resetForm = () => {
    setSku('');
    setName('');
    setDescription('');
    setSelectedCategoryId('');
    setCostPrice('');
    setSellingPrice('');
    setMrp('');
    setDiscountPercentage('');
    setCurrentStock('');
    setLowStockThreshold('');
    setManufactureDate('');
    setExpiryDate('');
    // Optionally clear error/success messages too, or let them persist briefly
    // setError('');
    // setSuccess('');
  };

  // --- Handle Submit ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors on new submit
    setSuccess(''); // Clear previous success on new submit

    // Frontend Validation
    if (!sku || !name || !selectedCategoryId || sellingPrice === '' || currentStock === '') {
      setError('SKU, Product Name, Category, Selling Price, and Current Stock are required.');
      return;
    }
     if (isNaN(parseFloat(sellingPrice)) || isNaN(parseInt(currentStock, 10))) {
         setError('Please enter valid numbers for prices and stock.');
         return;
     }
     // Add more specific validations (e.g., cost price <= selling price?, date logic?)

    setLoading(true); // Start loading indicator

    // Prepare data payload matching backend Product schema
    const productData = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim(),
      categoryId: selectedCategoryId,
      costPrice: costPrice !== '' ? parseFloat(costPrice) : undefined,
      sellingPrice: parseFloat(sellingPrice),
      mrp: mrp !== '' ? parseFloat(mrp) : undefined,
      discountPercentage: discountPercentage !== '' ? parseFloat(discountPercentage) : undefined,
      currentStock: parseInt(currentStock, 10),
      lowStockThreshold: lowStockThreshold !== '' ? parseInt(lowStockThreshold, 10) : undefined,
      manufactureDate: manufactureDate || undefined,
      expiryDate: expiryDate || undefined,
    };

    try {
      console.log('Submitting Product Data:', productData);
      const createdProduct = await createProduct(productData); // <-- Use actual API call

      setSuccess(`Product '${createdProduct.name}' added successfully!`);

      // --- Create Initial Stock Adjustment Record ---
      // Ensure we have the needed info before proceeding
      if (createdProduct && createdProduct._id && createdProduct.currentStock > 0 && user?._id) {
          try {
              // Prepare adjustment data
              const adjustmentData = {
                  productId: createdProduct._id,
                  quantityChange: createdProduct.currentStock,
                  reason: 'Initial Stock',
                  notes: `Initial stock set during product creation.`
                  // Backend should ideally get user ID from token via protect middleware
              };
              console.log('Creating initial stock adjustment:', adjustmentData);
              await createStockAdjustment(adjustmentData); // Call the service
              console.log(`Initial stock adjustment record created for ${createdProduct._id}`);
          } catch (adjError) {
              console.error(`Non-critical: Failed to create initial stock adjustment for ${createdProduct._id}:`, adjError);
              // Decide how to handle this - maybe add a secondary warning message?
              // setError(prev => prev ? `${prev}\nWarning: Failed to record initial stock adjustment.` : "Warning: Failed to record initial stock adjustment.");
          }
      } else if (createdProduct && createdProduct.currentStock > 0 && !user?._id) {
          console.warn("Could not create initial stock adjustment: User ID not available.");
      }
      // --- End Stock Adjustment ---

      resetForm(); // Clear form on success

    } catch (err) {
      console.error("Add Product Error:", err);
      // Display specific error from backend if available
      setError(err.response?.data?.message || err.message || 'Failed to add product.');
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  // --- Render Form ---
  return (
    <form onSubmit={handleSubmit} className={styles.addProductForm}>

      {/* Feedback Messages */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Form Grid */}
      <div className={styles.formGrid}>
        {/* Row 1: SKU and Name */}
        <InputField label="Product SKU / ID *" id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} required disabled={loading} />
        <InputField label="Product Name *" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />

        {/* Row 2: Category and Description */}
        <div className={`${styles.formGroup} ${styles.gridItem}`}>
          <label htmlFor="category" className={styles.label}>Category *</label>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            required
            disabled={loading || isFetchingCategories} // Disable if submitting or loading cats
            className={`${styles.inputField} ${styles.selectField}`}
          >
            <option value="" disabled>
              {isFetchingCategories ? 'Loading Categories...' : '-- Select Category --'}
            </option>
            {categoryList.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {isFetchingCategories && <Spinner size="small" inline={true} />} {/* Optional: inline spinner */}
        </div>
        <InputField label="Description" id="description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} rows={3}/>

        {/* Row 3: Pricing */}
        <InputField label="Cost Price (₹)" id="costPrice" type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} disabled={loading} />
        <InputField label="Selling Price (₹) *" id="sellingPrice" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required disabled={loading} />

        {/* Row 4: More Pricing */}
         <InputField label="Max Retail Price (MRP ₹)" id="mrp" type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} disabled={loading} />
         <InputField label="Discount (%)" id="discountPercentage" type="number" min="0" max="100" step="0.01" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} disabled={loading} placeholder="e.g., 5 or 10.5" />

        {/* Row 5: Stock */}
        <InputField label="Current Stock (Units) *" id="currentStock" type="number" min="0" step="1" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} required disabled={loading} />
        <InputField label="Low Stock Threshold" id="lowStockThreshold" type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} disabled={loading} placeholder="e.g., 10" />

        {/* Row 6: Dates */}
        <InputField label="Date of Manufacture" id="manufactureDate" type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} disabled={loading} />
        <InputField label="Expiry Date" id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} disabled={loading} />

      </div> {/* End Form Grid */}


      {/* Submit Button Container */}
      <div className={styles.submitButtonContainer}>
        <Button type="submit" disabled={loading || isFetchingCategories} variant="primary" size="large">
          {loading ? <Spinner size="small" /> : 'Add Product'}
        </Button>
      </div>

    </form>
  );
};

export default AddProductForm;