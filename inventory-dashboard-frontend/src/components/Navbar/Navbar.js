// src/components/Navbar/Navbar.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useAuth } from '../../hooks/useAuth';
import { FaUserCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';

const Navbar = ({ isSidebarCollapsed }) => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className={`${styles.navbar} ${isSidebarCollapsed ? styles.navbarCollapsed : ''}`}>
      {/* Actions Area */}
      {isAuthenticated ? (
        // Profile Icon Link
        <NavLink
          to="/profile"
          className={({ isActive }) => `${styles.iconLink} ${isActive ? styles.activeIconLink : ''}`}
          title="View Profile"
        >
          <FaUserCircle className={styles.profileIcon} />
        </NavLink>
      ) : (
        // Login/Signup Links
        <div className={styles.authLinks}>
           <Link to="/login" className={styles.navLink}>Login</Link>
           <Link to="/signup" className={styles.navLink}>Sign Up</Link>
        </div>
      )}
    </nav>
  );
};

// Define PropTypes
Navbar.propTypes = {
  isSidebarCollapsed: PropTypes.bool.isRequired,
};

export default Navbar;