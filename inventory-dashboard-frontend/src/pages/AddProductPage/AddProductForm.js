import React, { useState, useEffect } from 'react';
import styles from './AddProductPage.module.css';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
import { createProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { createStockAdjustment } from '../../services/stockAdjustmentService';
import { useAuth } from '../../hooks/useAuth';

const AddProductForm = ({ key: categoryUpdateKey }) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setIsFetchingCategories(true);
      try {
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
    return () => { isMounted = false };
  }, [categoryUpdateKey]);

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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!sku || !name || !selectedCategoryId || sellingPrice === '' || currentStock === '') {
      setError('SKU, Product Name, Category, Selling Price, and Current Stock are required.');
      return;
    }
    if (isNaN(parseFloat(sellingPrice)) || isNaN(parseInt(currentStock, 10))) {
      setError('Please enter valid numbers for prices and stock.');
      return;
    }

    setLoading(true);
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
      const createdProduct = await createProduct(productData);
      setSuccess(`Product '${createdProduct.name}' added successfully!`);

      if (createdProduct && createdProduct._id && createdProduct.currentStock > 0 && user?._id) {
        try {
          const adjustmentData = {
            productId: createdProduct._id,
            quantityChange: createdProduct.currentStock,
            reason: 'Initial Stock',
            notes: `Initial stock set during product creation.`
          };
          await createStockAdjustment(adjustmentData);
        } catch (adjError) {
          console.error(`Non-critical: Failed to create initial stock adjustment for ${createdProduct._id}:`, adjError);
        }
      } else if (createdProduct && createdProduct.currentStock > 0 && !user?._id) {
        console.warn("Could not create initial stock adjustment: User ID not available.");
      }
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

      <div className={styles.formGrid}>
        <InputField label="Product SKU / ID *" id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} required disabled={loading} />
        <InputField label="Product Name *" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
        <div className={`${styles.formGroup} ${styles.gridItem}`}>
          <label htmlFor="category" className={styles.label}>Category *</label>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            required
            disabled={loading || isFetchingCategories}
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
          {isFetchingCategories && <Spinner size="small" inline={true} />}
        </div>
        <InputField label="Description" id="description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} rows={3} />
        <InputField label="Cost Price (₹)" id="costPrice" type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} disabled={loading} />
        <InputField label="Selling Price (₹) *" id="sellingPrice" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required disabled={loading} />
        <InputField label="Max Retail Price (MRP ₹)" id="mrp" type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} disabled={loading} />
        <InputField label="Discount (%)" id="discountPercentage" type="number" min="0" max="100" step="0.01" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} disabled={loading} placeholder="e.g., 5 or 10.5" />
        <InputField label="Current Stock (Units) *" id="currentStock" type="number" min="0" step="1" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} required disabled={loading} />
        <InputField label="Low Stock Threshold" id="lowStockThreshold" type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} disabled={loading} placeholder="e.g., 10" />
        <InputField label="Date of Manufacture" id="manufactureDate" type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} disabled={loading} />
        <InputField label="Expiry Date" id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} disabled={loading} />
      </div>

      <div className={styles.submitButtonContainer}>
        <Button type="submit" disabled={loading || isFetchingCategories} variant="primary" size="large">
          {loading ? <Spinner size="small" /> : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default AddProductForm;