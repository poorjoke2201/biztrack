/*import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { login } from '../../services/authService'; // Assuming you have an authService

const LoginForm = () => {
  const [identifier, setIdentifier] = useState(''); // Can be username or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(identifier, password);
      setLoading(false);

      if (response && response.token) {
        // Store the token (e.g., in local storage or context)
        localStorage.setItem('authToken', response.token);
        // Redirect to the dashboard or a protected route
        navigate('/dashboard');
      } else if (response && response.message) {
        setError(response.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      setError('An unexpected error occurred.');
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.formGroup}>
        <label htmlFor="identifier">Username or Email</label>
        <input
          type="text"
          id="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
      <button type="submit" disabled={loading}>
        {loading ? 'Logging In...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;*/

/*import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { login } from '../../services/authService'; // Assuming you have an authService

const LoginForm = () => {
  const [identifier, setIdentifier] = useState(''); // Can be username or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(identifier, password);
      setLoading(false);

      if (response && response.token) {
        // Store the token (e.g., in local storage or context)
        localStorage.setItem('authToken', response.token);
        // Redirect to the dashboard or a protected route
        navigate('/dashboard');
      } else if (response && response.message) {
        setError(response.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      setError('An unexpected error occurred.');
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.formGroup}>
        <label htmlFor="identifier">Username or Email</label>
        <input
          type="text"
          id="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
      <button type="submit" disabled={loading}>
        {loading ? 'Logging In...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;*/

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Keep Link import (might be needed elsewhere, or remove if truly unused)
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css'; // Styles specific to the login form/page

// Import your reusable components using the provided paths
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error("LoginForm handleSubmit error:", err);
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Assuming styles.loginForm provides the main form container styling
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      {/* Optional: Add a heading if not provided by LoginPage.js */}
      {/* <h3 className={styles.formTitle}>Login</h3> */}

      {error && <Alert type="error" message={error} />}

      <InputField
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete='email'
        disabled={loading}
      />

      <InputField
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete='current-password'
        disabled={loading}
      />

      <Button
        type="submit"
        disabled={loading}
        className={styles.loginButton}
      >
        {loading ? <Spinner size="small" /> : 'Login'}
      </Button>

      {/* --- REMOVED DUPLICATE LINK FROM HERE --- */}
      {/*
      <p className={styles.signupLink}>
         Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
      */}
      {/* --- --- */}

    </form>
  );
};

export default LoginForm;