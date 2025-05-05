import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Assuming CSS module exists or use a shared one
import styles from './EditEmployeePage.module.css';
// Import the update service function
import { updateEmployee } from '../../services/employeeService';
import Alert from '../../components/Alert/Alert'; // Assuming components exist
import Spinner from '../../components/Spinner/Spinner'; // Assuming components exist

const EditEmployeeForm = ({ initialEmployee }) => {
  // --- State variables matching User model (editable fields) ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Display only, not editable here
  const [role, setRole] = useState(''); // Role will be editable

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id: employeeId } = useParams(); // Get employeeId from URL

  // --- Pre-fill Form ---
  useEffect(() => {
    if (initialEmployee) {
      console.log("Pre-filling employee form with:", initialEmployee);
      setName(initialEmployee.name || '');
      setEmail(initialEmployee.email || ''); // Set email for display
      setRole(initialEmployee.role || 'staff'); // Default to 'staff' if missing
    }
  }, [initialEmployee]);

  // --- Handle Submit ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    // Basic Frontend Validation
    if (!name || !role) {
        setError('Employee Name and Role are required.');
        return;
    }

    setLoading(true);

    try {
      // --- Construct data object for UPDATE ---
      // Only include fields that are meant to be updated by this form
      const employeeData = {
        name,
        role,
        // Do NOT include email if it's read-only
        // Do NOT include password here
      };

      console.log(`Sending update data for employee ${employeeId}:`, employeeData);

      // Call the correct update service function
      const response = await updateEmployee(employeeId, employeeData);
      setLoading(false);

      // Check success based on backend response (updated user object)
      if (response && response._id) {
        setSuccessMessage(`Employee '${response.name}' updated successfully!`);
        // Redirect back to employee list after a short delay
        setTimeout(() => navigate('/view-employees'), 1500);
      } else {
        setError(response?.message || 'Failed to update employee. Unexpected response.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Error updating employee:', err);
      setError(err.response?.data?.message || err.message || 'An unexpected network or server error occurred.');
    }
  };

  // --- Render Form ---
  return (
    <form onSubmit={handleSubmit} className={styles.editEmployeeForm}>
      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Name Input */}
      <div className={styles.formGroup}>
        <label htmlFor="name">Employee Name *</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Email Display (Read-Only) */}
      <div className={styles.formGroup}>
        <label htmlFor="email">Email (Read-Only)</label>
        <input
          type="email"
          id="email"
          value={email}
          readOnly // Make it non-editable
          className={styles.readOnlyInput} // Optional: style differently
        />
      </div>

      {/* Role Select */}
      <div className={styles.formGroup}>
        <label htmlFor="role">Role *</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
          {/* Add other roles if applicable */}
        </select>
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={loading}>
        {loading ? <Spinner size="small" /> : 'Update Employee'}
      </button>
      {/* Cancel Button */}
      <button type="button" onClick={() => navigate('/view-employees')} className={styles.cancelButton} disabled={loading}>
        Cancel
      </button>
    </form>
  );
};

export default EditEmployeeForm;