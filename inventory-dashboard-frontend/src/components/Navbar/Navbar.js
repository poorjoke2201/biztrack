import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useAuth } from '../../hooks/useAuth'; // Assuming you have this hook

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">Inventory Dashboard</Link>
      </div>
      <ul className={styles.navLinks}>
        {isAuthenticated && (
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/view-inventory">Inventory</Link>
            </li>
            <li>
              <Link to="/view-invoices">Invoices</Link>
            </li>
            <li>
              <Link to="/view-employees">Employees</Link>
            </li>
            <li>
              <Link to="/analytics">Analytics</Link>
            </li>
            {user && <li className={styles.user}>Welcome, {user.firstName || 'User'}</li>}
            <li>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </li>
          </>
        )}
        {!isAuthenticated && (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;