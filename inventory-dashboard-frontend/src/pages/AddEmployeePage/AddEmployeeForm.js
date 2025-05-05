import React, { useState } from 'react';
// Removed useNavigate as it wasn't used in the provided snippet
// import { useNavigate } from 'react-router-dom';
import styles from './AddEmployeePage.module.css';
import { addEmployee } from '../../services/employeeService';

const AddEmployeeForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  // --- ADDED PASSWORD STATE ---
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // --- Default role to 'staff' or let it be empty if backend handles default ---
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate(); // If you need navigation after success

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    // --- Optional: Add password validation ---
    if (!password) {
        setError('Password is required.');
        return;
    }
     if (password.length < 6) { // Example minimum length
        setError('Password must be at least 6 characters long.');
        return;
    }

    setLoading(true);

    try {
      // --- CONSTRUCT DATA AS BACKEND EXPECTS ---
      const newEmployeeData = {
        name: `${firstName} ${lastName}`.trim(), // Combine first and last name
        email,
        password, // Include password
        role: role || 'staff', // Ensure role is sent, default if needed
        // --- Include phoneNumber ONLY if your backend User model has it AND the route saves it ---
        // phoneNumber,
      };

      console.log('Sending data to addEmployee service:', newEmployeeData); // Debugging log

      const response = await addEmployee(newEmployeeData); // Pass the corrected data object
      setLoading(false);

      // --- ADJUSTED SUCCESS CHECK ---
      // Check if the response has an _id (indicating successful creation)
      if (response && response._id) {
        setSuccessMessage(`Employee '${response.name}' added successfully!`);
        // Optionally reset the form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword(''); // Reset password field
        setPhoneNumber('');
        setRole('staff'); // Reset role to default
        // Optionally navigate away after success
        // setTimeout(() => navigate('/employees'), 2000); // Example navigation
      } else if (response && response.message) {
        // Handle specific error messages from backend (e.g., "User already exists")
        setError(response.message);
      } else {
        // Generic failure message if response is unexpected
        setError('Failed to add employee. Please check the details and try again.');
      }
    } catch (err) { // Changed variable name from 'error' to 'err' to avoid conflict
      setLoading(false);
      // Log the detailed error from the service/axios
      console.error('Error adding employee:', err);
       // Try to display a more specific error from the backend if available
       if (err.response && err.response.data && err.response.data.message) {
           setError(`Error: ${err.response.data.message}`);
       } else if (err.message) {
           setError(`Error: ${err.message}`);
       } else {
           setError('An unexpected network or server error occurred.');
       }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.addEmployeeForm}>
      {/* Keep error and success messages */}
      {error && <div className={styles.error}>{error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      {/* --- Input Fields --- */}
      <div className={styles.formGroup}>
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          aria-describedby={error ? 'error-message' : undefined} // Accessibility
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          aria-describedby={error ? 'error-message' : undefined}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-describedby={error ? 'error-message' : undefined}
        />
      </div>

      {/* --- ADDED PASSWORD FIELD --- */}
      <div className={styles.formGroup}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6" // Example validation
          aria-describedby={error ? 'error-message' : undefined}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phoneNumber">Phone Number (Optional)</label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          aria-describedby={error ? 'error-message' : undefined}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="role">Role</label>
        <select // Changed to select for potentially predefined roles
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          aria-describedby={error ? 'error-message' : undefined}
        >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            {/* Add other roles if applicable */}
        </select>
        {/* Or keep as input if roles are freeform:
        <input
          type="text"
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        /> */}
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={loading}>
        {loading ? 'Adding Employee...' : 'Add Employee'}
      </button>
       {/* For accessibility with errors */}
       {error && <p id="error-message" style={{ display: 'none' }}>{error}</p>}
    </form>
  );
};

export default AddEmployeeForm;