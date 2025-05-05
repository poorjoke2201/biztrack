/*import React, { useState } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import styles from './SignupPage.module.css';
import { signup } from '../../services/authService'; // Assuming you have this service

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username,
        email,
        password,
      };

      const response = await signup(userData);
      setLoading(false);

      if (response && response.success) {
        setSuccessMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else if (response && response.message) {
        setError(response.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      setError('An unexpected error occurred.');
      console.error('Error signing up:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.signupForm}>
      {error && <div className={styles.error}>{error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}
      <div className={styles.formGroup}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
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
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
      <p className={styles.loginLink}>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </form>
  );
};

export default SignupForm;*/

/*import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './SignupPage.module.css';
import { signup } from '../../services/authService'; // Assuming you have this service

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('staff'); // Default to 'staff'
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name,
        email,
        password,
        role, // Include the selected role
      };

      const response = await signup(userData);
      setLoading(false);

      if (response && response.success) {
        setSuccessMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else if (response && response.message) {
        setError(response.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      setError('An unexpected error occurred.');
      console.error('Error signing up:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.signupForm}>
      {error && <div className={styles.error}>{error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}
      <div className={styles.formGroup}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
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
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="role">Role</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
      <p className={styles.loginLink}>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </form>
  );
};

export default SignupForm;*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';
import { signup as authServiceSignup } from '../../services/authService';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword || !role) {
        setError('Please fill in all fields.');
        return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setLoading(true);

    try {
        const signupData = { name, email, password, role };
        console.log('Attempting signup with:', { name, email, role });
        const response = await authServiceSignup(signupData);
        setLoading(false);

        if (response && response._id) {
             console.log("Signup successful!", response);
             navigate('/login', { state: { message: 'Signup successful! Please log in.' } });
        } else {
             setError(response?.message || 'Signup failed. Unexpected response.');
        }

    } catch (err) {
        setLoading(false);
        console.error("Signup page error:", err);
        setError(err.response?.data?.message || err.message || 'An error occurred during signup.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.signupForm}>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {/* Or use Alert: {error && <Alert type="error" message={error} />} */}

      {/* Form Group for Name */}
      <div className={`form-group ${styles.formGroup}`}>
        <label htmlFor="name" className={styles.label}>Enter name:</label>
        <input
          type="text"
          id="name"
          className={`form-input ${styles.inputField}`}
          placeholder="Your full name" // <<< ADDED PLACEHOLDER
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {/* Form Group for Email */}
      <div className={`form-group ${styles.formGroup}`}>
        <label htmlFor="email" className={styles.label}>Enter email:</label>
        <input
          type="email"
          id="email"
          className={`form-input ${styles.inputField}`}
          placeholder="you@example.com" // <<< ADDED PLACEHOLDER
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete='email'
          disabled={loading}
        />
      </div>

      {/* Form Group for Password */}
      <div className={`form-group ${styles.formGroup}`}>
        <label htmlFor="password" className={styles.label}>Enter Password:</label>
        <input
          type="password"
          id="password"
          className={`form-input ${styles.inputField}`}
          placeholder="Create a strong password (min. 6 chars)" // <<< ADDED PLACEHOLDER
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete='new-password'
          disabled={loading}
        />
      </div>

      {/* Form Group for Confirm Password */}
      <div className={`form-group ${styles.formGroup}`}>
        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          className={`form-input ${styles.inputField}`}
          placeholder="Re-enter your password" // <<< ADDED PLACEHOLDER
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete='new-password'
          disabled={loading}
        />
      </div>

      {/* Form Group for Role Selection */}
      <div className={`form-group ${styles.formGroup}`}>
        <label htmlFor="role" className={styles.label}>Choose role:</label>
        <select
           id="role"
           className={`form-input ${styles.inputField} ${styles.selectField}`}
           value={role}
           onChange={(e) => setRole(e.target.value)}
           required
           disabled={loading}
         >
           <option value="" disabled>Select Role</option>
           <option value="staff">Staff</option>
           <option value="admin">Admin</option>
         </select>
      </div>

      <button
        type="submit"
        className={`btn btn-primary ${styles.signupButton}`}
        disabled={loading}
      >
        {loading ? <Spinner size="small" /> : 'Submit'}
      </button>
    </form>
  );
};

export default SignupForm;