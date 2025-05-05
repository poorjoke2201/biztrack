import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
//import MainLayout from '../../layouts/MainLayout/MainLayout';
import SearchBar from '../../components/SearchBar/SearchBar';
import Table from '../../components/Table/Table';
import styles from './ViewInventoryPage.module.css';
// Import deleteProduct from your service
import { getAllProducts, deleteProduct } from '../../services/inventoryService';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';

const ViewInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null); // Specific error state for actions
  const navigate = useNavigate(); // Initialize useNavigate

  // --- Fetching Logic ---
  useEffect(() => {
    let isMounted = true; // Flag to prevent state update on unmounted component
    const fetchProducts = async () => {
        console.log("Attempting to fetch products...");
        setLoading(true);
        setError(null);
        setActionError(null); // Clear action error on refresh
        try {
            const data = await getAllProducts();
            console.log("Products data received:", data);
            if (isMounted) { // Check if component is still mounted
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.error("Received non-array data from getAllProducts:", data);
                    setError('Failed to load inventory: Invalid data format received.');
                    setProducts([]);
                }
                setLoading(false);
            }
        } catch (err) {
             if (isMounted) {
                console.error('Error fetching inventory:', err);
                const message = err.response?.data?.message || err.message || 'Failed to load inventory due to a network or server error.';
                setError(message);
                setLoading(false);
                setProducts([]);
             }
        }
    };
    fetchProducts();

    // Cleanup function to set the flag false when component unmounts
    return () => { isMounted = false; };
}, []);


  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // --- Filter Logic ---
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  const filteredProducts = products.filter(product => {
      if (!product) return false;
      // Safe checks before calling methods
      const nameMatch = product.name && typeof product.name === 'string' && product.name.toLowerCase().includes(lowerCaseSearchTerm);
      const categoryMatch = product.category && typeof product.category === 'string' && product.category.toLowerCase().includes(lowerCaseSearchTerm);
      const priceMatch = product.selling_price !== undefined && product.selling_price !== null && product.selling_price.toString().includes(searchTerm);
      const stockMatch = product.stock !== undefined && product.stock !== null && product.stock.toString().includes(searchTerm);
      const idMatch = product._id && typeof product._id === 'string' && product._id.toLowerCase().includes(lowerCaseSearchTerm);
      return nameMatch || categoryMatch || priceMatch || stockMatch || idMatch;
  });

  // --- Edit Handler ---
  const handleEdit = (productId) => {
    console.log(`Navigating to edit page for product: ${productId}`);
    navigate(`/edit-product/${productId}`); // Navigate to the edit route
  };

  // --- Delete Handler ---
  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete product "${productName}"? This cannot be undone.`)) {
      setActionError(null); // Clear previous action errors
      try {
        console.log(`Attempting to delete product: ${productId}`);
        const response = await deleteProduct(productId); // Call service function
        console.log('Delete response:', response);

        if (response && response.message === 'Product removed') {
           setProducts(currentProducts => currentProducts.filter(p => p._id !== productId));
           console.log(`Product ${productId} removed from local state.`);
           // Consider adding a temporary success message state if needed
        } else {
             setActionError(response?.message || 'Failed to delete product. Unexpected response.');
        }
      } catch (err) {
        console.error(`Error deleting product ${productId}:`, err);
        const message = err.response?.data?.message || err.message || 'Could not delete product.';
        setActionError(message);
      }
    }
  };


  // --- Define Columns with working Edit/Delete ---
  const productColumns = [
    { header: 'Name', key: 'name' },
    { header: 'Category', key: 'category' },
    { header: 'Selling Price', key: 'selling_price', format: (value) => value != null ? `₹${Number(value).toFixed(2)}` : 'N/A' },
    { header: 'Stock', key: 'stock' },
    { header: 'Low Stock Threshold', key: 'lowStockThreshold'},
    {
      header: 'Actions',
      key: 'actions',
      render: (product) => (
        <div className={styles.actionButtonsContainer}> {/* Optional: for styling */}
          <button title="Edit Product" className={styles.actionButton} onClick={() => handleEdit(product._id)}>Edit</button>
          <button title="Delete Product" className={styles.actionButtonDelete} onClick={() => handleDelete(product._id, product.name)}>Delete</button>
        </div>
      ),
    },
  ];

  // --- Render Logic (includes actionError) ---
    if (loading) {
    return (
      //<MainLayout>
        <div className={styles.viewInventoryPage}>
          <h2>View Inventory</h2>
          <Spinner />
          <p>Loading inventory...</p>
        </div>
      //</MainLayout>
    );
  }

  // Display general page load error first
  if (error) {
    return (
      //<MainLayout>
        <div className={styles.viewInventoryPage}>
          <h2>View Inventory</h2>
          <Alert type="error" message={error} />
        </div>
      //</MainLayout>
    );
  }

  return (
    //<MainLayout>
      <div className={styles.viewInventoryPage}>
        <h2>View Inventory</h2>
        {/* Display action error if present (e.g., from delete) */}
        {actionError && <Alert type="error" message={actionError} />}
        <SearchBar onSearch={handleSearch} placeholder="Search by name, category, ID..." />
        <Table columns={productColumns} data={filteredProducts} />
         {/* Messages for empty states */}
         {filteredProducts.length === 0 && searchTerm && (
           <p className={styles.noResults}>No products found matching "{searchTerm}".</p>
        )}
         {products.length > 0 && filteredProducts.length === 0 && !searchTerm && (
           <p className={styles.noResults}>No products match the current filter.</p>
        )}
         {products.length === 0 && !error && ( // Check !error here too
             <p className={styles.noResults}>Your inventory is currently empty.</p>
         )}
      </div>
    //</MainLayout>
  );
};

export default ViewInventoryPage;