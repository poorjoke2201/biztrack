// src/pages/DeleteProductPage/DeleteProductPage.js
import React, { useState, useEffect, useCallback } // <-- Added useCallback
from 'react';
import styles from './DeleteProductPage.module.css';
// --- Import ACTUAL service functions ---
import { searchProducts, deleteProduct } from '../../services/productService'; // <-- Use actual service
// --- Import ACTUAL components (Adjust paths if needed) ---
// import SearchBar from '../../components/SearchBar/SearchBar'; // Assuming a reusable SearchBar
import InputField from '../../components/InputField/InputField'; // Using InputField for now
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Modal from '../../components/Modal/Modal'; // Assuming a Modal component
import Spinner from '../../components/Spinner/Spinner';

const DeleteProductPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]); // Products matching search
  const [selectedProduct, setSelectedProduct] = useState(null); // Product chosen for deletion
  const [isLoading, setIsLoading] = useState(false); // For search loading
  const [isDeleting, setIsDeleting] = useState(false); // Separate state for deletion loading
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- Define handleSearch using useCallback ---
  const handleSearch = useCallback(async () => {
     // Don't search if term is too short - handled by useEffect check now
    // if (!searchTerm || searchTerm.trim().length < 2) {
    //     setProducts([]);
    //     return;
    // }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      console.log(`Searching for products matching: ${searchTerm}`);
      const results = await searchProducts(searchTerm.trim()); // <-- Use actual API call
      setProducts(results || []); // Ensure it's an array

    } catch (err) {
      console.error("Search error:", err);
      setError(err.response?.data?.message || "Failed to search products.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]); // Dependency: re-create if searchTerm changes (for debouncing)

  // --- Debounced search effect ---
  useEffect(() => {
    // Only trigger search if term is valid
    if (searchTerm.trim().length > 1) {
        // Set up the timer
        const handler = setTimeout(() => {
            handleSearch(); // Call the memoized search function
        }, 500); // Delay API call

        // Cleanup function to clear the timeout if searchTerm changes quickly
        return () => {
            clearTimeout(handler);
        };
    } else {
        // Clear results immediately if search term is too short
        setProducts([]);
    }
    // This useEffect depends on handleSearch and searchTerm.
    // Since handleSearch itself depends on searchTerm via useCallback,
    // just depending on searchTerm might be enough for triggering, but
    // including handleSearch satisfies the exhaustive-deps rule.
  }, [searchTerm, handleSearch]); // <-- Include handleSearch in dependencies

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true); // Use separate deleting state
    setError('');
    setSuccess('');
    try {
      console.log(`Deleting product ID: ${selectedProduct._id}`);
      const response = await deleteProduct(selectedProduct._id); // <-- Use actual API call

      setSuccess(response.message || `Successfully deleted product: ${selectedProduct.name}`);
      setSelectedProduct(null);
      setShowConfirmModal(false);
      // Refresh search results to remove deleted item
      handleSearch(); // Re-run search

    } catch (err) {
      console.error("Delete error:", err);
      // Use error message from response if available (e.g., "Cannot delete product...")
      setError(err.response?.data?.message || `Failed to delete product: ${err.message || 'Server error'}`);
      // Keep modal open on error? Or close? Closing for now.
      setShowConfirmModal(false);
    } finally {
      setIsDeleting(false); // Finish deleting process
    }
  };

  const closeModal = () => {
    if (isDeleting) return; // Prevent closing while delete is in progress
    setShowConfirmModal(false);
    setSelectedProduct(null);
  }

  return (
    <div className={styles.deleteProductContainer}>
      <h2>Delete Product</h2>
      <p>Search for the product you want to permanently delete. Note: Products used in invoices cannot be deleted.</p>

      {/* Use InputField component */}
      <div className={styles.searchSection}>
        <InputField
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading || isDeleting} // Disable input during loading/deleting
        />
         {/* Optional search button if not relying solely on debounce */}
         {/* <Button onClick={handleSearch} disabled={isLoading || !searchTerm}>Search</Button> */}
         {isLoading && <Spinner size="small" />} {/* Show spinner next to input */}
      </div>

      {/* Use Alert component */}
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className={styles.resultsContainer}>
        {!isLoading && products.length > 0 && ( // Only show list when not loading search results
          <ul className={styles.productList}>
            {products.map(product => (
              <li key={product._id} className={styles.productItem}>
                <span>{product.name} (SKU: {product.sku}) - Stock: {product.currentStock ?? 'N/A'}</span>
                {/* Use Button component */}
                <Button
                  onClick={() => handleDeleteClick(product)}
                  variant="danger" // Assuming a danger variant for styling
                  size="small"
                  disabled={isDeleting} // Disable button during any delete operation
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && searchTerm && products.length === 0 && (
            <p>No products found matching "{searchTerm}".</p>
        )}
      </div>

      {/* Use Modal component */}
      <Modal
        isOpen={showConfirmModal}
        onClose={closeModal}
        title="Confirm Deletion"
      >
        {selectedProduct && ( // Ensure selectedProduct exists before rendering content
            <>
                <p>Are you sure you want to permanently delete the product: <strong>{selectedProduct.name}</strong> (SKU: {selectedProduct.sku})?</p>
                <p>This action cannot be undone.</p>
                <div className={styles.modalActions}> {/* Style actions */}
                    <Button onClick={closeModal} disabled={isDeleting} variant="secondary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} disabled={isDeleting} variant="danger">
                        {isDeleting ? <Spinner size="small" /> : 'Confirm Delete'}
                    </Button>
                </div>
            </>
        )}
      </Modal>

    </div>
  );
};

export default DeleteProductPage;