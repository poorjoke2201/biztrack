import React, { useState } from 'react';
import styles from './AddProductPage.module.css';
import AddProductForm from './AddProductForm';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import CategoryAddForm from '../../components/categories/CategoryAddForm';

// TODO: Import icons if using an icon library

const AddProductPage = () => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryAddedKey, setCategoryAddedKey] = useState(0);

  const handleManageCategories = () => {
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  const handleCategoryAdded = (newCategory) => {
    console.log("New category added:", newCategory);
    handleCloseCategoryModal();
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
          <Button onClick={handleManageCategories} variant="secondary" size="small">
            ➕ Manage Categories
          </Button>
          <Button onClick={handleUploadFile} variant="outline" size="small">
            ⬆️ Bulk Upload
          </Button>
        </div>
      </div>

      <div className={styles.formContainer}>
        <AddProductForm key={categoryAddedKey} />
      </div>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        title="Add New Category"
      >
        <CategoryAddForm onCategoryAdded={handleCategoryAdded} />
      </Modal>
    </div>
  );
};

export default AddProductPage;