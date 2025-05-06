// src/components/categories/CategoryAddForm.js
import React, { useState } from 'react';
import styles from './CategoryAddForm.module.css';
import { createCategory } from '../../services/categoryService'; // Correct path
import InputField from '../InputField/InputField'; // Assuming InputField component
import Button from '../Button/Button';
import Alert from '../Alert/Alert';
import Spinner from '../Spinner/Spinner';

// Accepts a callback function to run after successful addition
const CategoryAddForm = ({ onCategoryAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setLoading(true);
    try {
      const newCategoryData = { name: name.trim(), description: description.trim() };
      const createdCategory = await createCategory(newCategoryData);
      setSuccess(`Category "${createdCategory.name}" added successfully!`);
      setName(''); // Clear form
      setDescription('');
      // Call the callback function passed from the parent (e.g., AddProductPage)
      // This tells the parent that a new category was added, so it can refetch
      if (onCategoryAdded) {
        onCategoryAdded(createdCategory); // Pass the new category data back
      }
    } catch (err) {
      console.error("Error adding category:", err);
      setError(err.response?.data?.message || 'Failed to add category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.categoryForm}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')}/>}

      <InputField
        label="New Category Name *"
        id="categoryName"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
        placeholder="e.g., Electronics, Snacks"
      />

      <InputField
        label="Description (Optional)"
        id="categoryDescription"
        type="textarea" // Use textarea for potentially longer descriptions
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
        placeholder="Brief description of the category"
      />

      <div className={styles.buttonContainer}>
        <Button type="submit" disabled={loading} variant="primary">
          {loading ? <Spinner size="small" /> : 'Add Category'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryAddForm;