import React, { useState, useEffect } from 'react';
import styles from './DeleteProductPage.module.css';
// --- TODO: Import API service functions ---
// import { searchProducts, deleteProduct } from '../../services/productService';
// --- TODO: Import necessary components ---
// import SearchBar from '../../components/SearchBar/SearchBar';
// import Button from '../../components/Button/Button';
// import Alert from '../../components/Alert/Alert';
// import Modal from '../../components/Modal/Modal';

const DeleteProductPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]); // Products matching search
  const [selectedProduct, setSelectedProduct] = useState(null); // Product chosen for deletion
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Debounced search effect (optional but good practice)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim().length > 1) { // Only search if term is long enough
        handleSearch();
      } else {
        setProducts([]); // Clear results if search term is short
      }
    }, 500); // Delay API call slightly after user stops typing

    return () => {
      clearTimeout(handler); // Cleanup timeout on unmount or search term change
    };
  }, [searchTerm]);

  const handleSearch = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      // --- TODO: Replace with actual API call ---
      console.log(`Searching for products matching: ${searchTerm}`);
      // const results = await searchProducts(searchTerm);
      // setProducts(results);

      // --- Placeholder Data ---
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockResults = [
          { _id: 'prod101', name: 'Organic Apples', categoryName: 'Fruits', quantityInStock: 50 },
          { _id: 'prod205', name: 'Whole Wheat Bread', categoryName: 'Bakery', quantityInStock: 15 },
          { _id: 'prod401', name: 'Cheddar Cheese Block', categoryName: 'Dairy', quantityInStock: 30 },
      ].filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      setProducts(mockResults);
      // --- End Placeholder ---

    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search products.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowConfirmModal(true); // Show confirmation modal
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      // --- TODO: Replace with actual API call ---
      console.log(`Deleting product ID: ${selectedProduct._id}`);
      // await deleteProduct(selectedProduct._id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      // --- End Placeholder ---

      setSuccess(`Successfully deleted product: ${selectedProduct.name}`);
      setSelectedProduct(null);
      setShowConfirmModal(false);
      // Refresh search results or clear them
      handleSearch(); // Re-run search to remove deleted item
    } catch (err) {
      console.error("Delete error:", err);
      setError(`Failed to delete product: ${err.message || 'Server error'}`);
      setShowConfirmModal(false); // Close modal even on error
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setSelectedProduct(null);
  }

  return (
    <div className={styles.deleteProductContainer}>
      <h2>Delete Product Stock</h2>
      <p>Search for the product you want to delete.</p>

      {/* --- TODO: Replace with SearchBar component --- */}
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          disabled={isLoading}
        />
         {/* Optional: Add a search button or rely on debounced effect */}
         {/* <button onClick={handleSearch} disabled={isLoading || !searchTerm}>Search</button> */}
      </div>
       {/* --- End SearchBar Placeholder --- */}


      {isLoading && <p>Loading...</p>}
      {error && <div className={styles.errorMessage}>{error}</div>} {/* TODO: Use Alert component */}
      {success && <div className={styles.successMessage}>{success}</div>} {/* TODO: Use Alert component */}

      <div className={styles.resultsContainer}>
        {products.length > 0 ? (
          <ul className={styles.productList}>
            {products.map(product => (
              <li key={product._id} className={styles.productItem}>
                <span>{product.name} ({product.categoryName}) - Stock: {product.quantityInStock}</span>
                 {/* --- TODO: Replace with Button component --- */}
                <button
                  onClick={() => handleDeleteClick(product)}
                  className={styles.deleteButton}
                  disabled={isLoading}
                >
                  Delete
                </button>
                 {/* --- End Button Placeholder --- */}
              </li>
            ))}
          </ul>
        ) : (
          !isLoading && searchTerm && <p>No products found matching "{searchTerm}".</p>
        )}
      </div>

      {/* --- TODO: Replace with Modal component --- */}
      {showConfirmModal && selectedProduct && (
         <div className={styles.modalOverlay}>
             <div className={styles.modalContent}>
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to permanently delete the product: <strong>{selectedProduct.name}</strong>?</p>
                <p>This action cannot be undone.</p>
                <div className={styles.modalActions}>
                    <button onClick={closeModal} disabled={isLoading} className={styles.cancelButton}>Cancel</button>
                    <button onClick={confirmDelete} disabled={isLoading} className={styles.confirmButton}>Confirm Delete</button>
                </div>
             </div>
         </div>
      )}
       {/* --- End Modal Placeholder --- */}

    </div>
  );
};

export default DeleteProductPage;