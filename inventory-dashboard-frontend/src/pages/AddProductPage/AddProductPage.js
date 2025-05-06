// src/pages/AddProductPage/AddProductPage.js
import React, { useState } from 'react'; // <-- Added useState
import styles from './AddProductPage.module.css';
import AddProductForm from './AddProductForm';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal'; // <-- Import Modal
import CategoryAddForm from '../../components/categories/CategoryAddForm'; // <-- Import Category Form

// TODO: Import icons if using an icon library

const AddProductPage = () => {
  // --- State to control the category modal ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  // --- State to trigger refetch in AddProductForm ---
  const [categoryAddedKey, setCategoryAddedKey] = useState(0); // Key to force re-render/refetch

  // --- Open category modal ---
  const handleManageCategories = () => {
    setIsCategoryModalOpen(true);
  };

  // --- Close category modal ---
  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  // --- Callback when a category is successfully added ---
  const handleCategoryAdded = (newCategory) => {
    console.log("New category added:", newCategory);
    handleCloseCategoryModal(); // Close modal on success
    // Increment key to trigger refetch in AddProductForm's useEffect
    setCategoryAddedKey(prevKey => prevKey + 1);
  };


  const handleUploadFile = () => {
    alert('Bulk Upload Products functionality TBD');
  };


  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>
          <span className={styles.iconPlaceholder}>🛒</span>
          Add New Product
        </h2>
        <div className={styles.headerActions}>
           {/* --- Updated "Manage Categories" Button --- */}
          <Button onClick={handleManageCategories} variant="secondary" size="small">
             ➕ Manage Categories
          </Button>
          <Button onClick={handleUploadFile} variant="outline" size="small">
             ⬆️ Bulk Upload
          </Button>
        </div>
      </div>

      <div className={styles.formContainer}>
         {/* Pass the key to AddProductForm to trigger refetch */}
        <AddProductForm key={categoryAddedKey} />
      </div>

      {/* --- Category Management Modal --- */}
      <Modal
          isOpen={isCategoryModalOpen}
          onClose={handleCloseCategoryModal}
          title="Add New Category"
        >
            {/* Render the category form inside the modal */}
            <CategoryAddForm onCategoryAdded={handleCategoryAdded} />
      </Modal>
    </div>
  );
};

export default AddProductPage;