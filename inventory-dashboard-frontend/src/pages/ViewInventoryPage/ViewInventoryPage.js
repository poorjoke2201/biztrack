// src/pages/products/ViewInventoryPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Import components (adjust paths if needed)
import SearchBar from '../../components/SearchBar/SearchBar';
import Table from '../../components/Table/Table';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
// Import services
import { getAllProducts, deleteProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
// Import CSS module
import styles from './ViewInventoryPage.module.css';
// Import helpers (if created)
import { formatCurrency } from '../../utils/helpers'; // Assuming helpers exist

const ViewInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const navigate = useNavigate();

  // --- Fetching Logic ---
  const fetchData = useCallback(async () => {
    console.log("Attempting to fetch products and categories...");
    setLoading(true);
    setLoadingCategories(true);
    setError(null);
    setActionError(null);
    setActionSuccess(null);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories()
      ]);
      if (Array.isArray(productsData)) setProducts(productsData);
      else throw new Error('Invalid product data format received.');
      if (Array.isArray(categoriesData)) setCategories([{ _id: 'All', name: 'All Categories' }, ...categoriesData]);
      else setCategories([{ _id: 'All', name: 'All Categories' }]);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      const message = err.response?.data?.message || err.message || 'Failed to load inventory data.';
      setError(message);
      setProducts([]);
      setCategories([{ _id: 'All', name: 'All Categories' }]);
    } finally {
      setLoading(false);
      setLoadingCategories(false);
    }
  }, []); // No dependencies needed here

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Filter Logic ---
  const filteredProducts = useMemo(() => {
    // ... (filtering logic remains the same) ...
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return products.filter(product => {
       if (!product) return false;
       const categoryFilterMatch = selectedCategoryId === 'All' || product.category?._id === selectedCategoryId;
       const searchFilterMatch = !searchTerm || (
         (product.name && product.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
         (product.sku && product.sku.toLowerCase().includes(lowerCaseSearchTerm)) ||
         (product.category?.name && product.category.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
         (product.sellingPrice != null && product.sellingPrice.toString().includes(lowerCaseSearchTerm)) ||
         (product.currentStock != null && product.currentStock.toString().includes(lowerCaseSearchTerm)) ||
         (product._id && product._id.toLowerCase().includes(lowerCaseSearchTerm))
       );
       return categoryFilterMatch && searchFilterMatch;
     });
  }, [products, searchTerm, selectedCategoryId]);

  // --- Wrap handlers used in columns with useCallback ---
  const handleEdit = useCallback((productId) => {
    const targetPath = `/edit-product/${productId}`;
    console.log(`Navigating to: ${targetPath}`);
    navigate(targetPath);
  }, [navigate]);

  const handleDelete = useCallback(async (productId, productName) => {
    setActionError(null);
    setActionSuccess(null);
    if (window.confirm(`Are you sure you want to delete product "${productName}"? This cannot be undone.`)) {
      try {
        const response = await deleteProduct(productId);
        setActionSuccess(response.message || `Product "${productName}" deleted.`);
        fetchData(); // Refresh list
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Could not delete product.';
        setActionError(message);
      }
    }
  }, [fetchData]); // Dependency: fetchData

  // --- Define Columns with memoized handlers ---
  const productColumns = useMemo(() => [
    { header: 'SKU', key: 'sku' },
    { header: 'Name', key: 'name' },
    { header: 'Category', key: 'category', render: (p) => p.category?.name || 'N/A' },
    { header: 'Selling Price', key: 'sellingPrice', format: (v) => formatCurrency(v) }, // Use helper
    { header: 'Stock', key: 'currentStock', render: (p) => (
        <span className={ p.currentStock <= 0 ? styles.outOfStock : p.currentStock <= p.lowStockThreshold ? styles.lowStock : '' }>
            {p.currentStock ?? 'N/A'}
        </span>
      )
    },
    { header: 'Actions', key: 'actions', render: (p) => (
        <div className={styles.actionButtonsContainer}>
          {/* Call memoized handlers */}
          <Button size="small" onClick={() => handleEdit(p._id)}>Edit</Button>
          <Button size="small" variant="danger" onClick={() => handleDelete(p._id, p.name)}>Delete</Button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete, formatCurrency]); // <-- Add handlers as dependencies, also helper if used directly

  // --- Render Logic ---
  if (loading) return <div className={styles.viewInventoryPage}><h2>View Inventory</h2><Spinner message="Loading inventory..." /></div>;
  if (error) return <div className={styles.viewInventoryPage}><h2>View Inventory</h2><Alert type="error" message={error} /></div>;

  return (
    <div className={styles.viewInventoryPage}>
      <h2>View Inventory</h2>
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}
      {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess(null)} />}

      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="categoryFilter">Filter by Category:</label>
          <select id="categoryFilter" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} disabled={loadingCategories} className={styles.categorySelect}>
            {categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
          </select>
          {loadingCategories && <Spinner size="small" inline={true} />}
        </div>
        <div className={styles.searchFilterGroup}>
          <SearchBar onSearch={setSearchTerm} placeholder="Search by SKU, name, category..." />
        </div>
      </div>

      <Table columns={productColumns} data={filteredProducts} />

      {!loading && filteredProducts.length === 0 && (searchTerm || selectedCategoryId !== 'All') && (<p className={styles.noResults}>No products found matching filters.</p>)}
      {!loading && products.length === 0 && !error && (<p className={styles.noResults}>Inventory is empty.</p>)}
    </div>
  );
};

export default ViewInventoryPage;