// src/pages/EditEmployeePage/EditEmployeeForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EditEmployeePage.module.css'; // Assuming styles are primarily in this module now
import { updateEmployee } from '../../services/employeeService';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
// Assuming InputField and Button have their own module.css for base styles
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';

const EditEmployeeForm = ({ initialEmployee }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const employeeId = initialEmployee?._id;

  useEffect(() => {
    if (initialEmployee) {
      setName(initialEmployee.name || '');
      setEmail(initialEmployee.email || '');
      setRole(initialEmployee.role || 'staff');
    }
  }, [initialEmployee]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); setSuccessMessage('');
    if (!employeeId) { setError("Employee ID is missing."); return; }
    if (!name || !role) { setError('Name and Role are required.'); return; }

    setLoading(true);
    const employeeData = { name, role };

    try {
      const response = await updateEmployee(employeeId, employeeData);
      setLoading(false);
      if (response && response._id) {
        setSuccessMessage(`Employee '${response.name}' updated!`);
        // setTimeout(() => navigate('/view-employees'), 1500);
      } else {
        setError(response?.message || 'Failed to update employee.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || 'Update error.');
    }
  };

  if (!initialEmployee) {
    return <Alert type="warning" message="Employee data not available." />;
  }

  return (
    // formContainer style is now part of EditEmployeePage.module.css
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.editEmployeeForm}>
        {/* Title can be in EditEmployeePage or here */}
        <h3>Editing: {initialEmployee.name}</h3>
        {error && <Alert type="error" message={error} onClose={() => setError('')}/>}
        {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')}/>}

        <div className={styles.formGroup}>
            <InputField
                label="Employee Name *"
                id="employeeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
            />
        </div>

        <div className={styles.formGroup}>
            <InputField
                label="Email (Read-Only)"
                id="employeeEmail"
                type="email"
                value={email}
                readOnly
                disabled
                className={styles.readOnlyInput}
            />
        </div>

        <div className={styles.formGroup}>
            <label htmlFor="employeeRole" className={styles.label}>Role *</label>
            <select
                id="employeeRole"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={loading}
                className={styles.selectField} // Use a general select style
            >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
            </select>
        </div>

        <div className={styles.buttonGroup}>
            <Button type="submit" disabled={loading} variant="primary">
                {loading ? <Spinner size="small" /> : 'Update Employee'}
            </Button>
            <Button type="button" onClick={() => navigate('/view-employees')} variant="secondary" disabled={loading}>
                Cancel
            </Button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployeeForm;