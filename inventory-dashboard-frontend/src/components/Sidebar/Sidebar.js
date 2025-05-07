// src/components/layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../../hooks/useAuth'; // Adjust path if needed

// Accept activePath and onLinkClick props from MainLayout
const Sidebar = ({ isCollapsed, toggleSidebar, activePath, onLinkClick }) => {

  const { user } = useAuth(); // Get user to check roles
  const isAdmin = user?.role === 'admin'; // Check if user is admin

  // Helper function to determine the className (using passed prop)
  const getLinkClassName = (path) => {
    return activePath === path ? styles.active : undefined;
  };

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Sidebar Header - Fixed */}
      <div className={styles.sidebarHeader}>
        {!isCollapsed && <span className={styles.logoText}>BizTrack</span>}
        <button onClick={toggleSidebar} className={styles.toggleButton}>
           ☰ {/* Replace with icon */}
        </button>
      </div>

      {/* Navigation - Scrollable */}
      <div className={styles.navContainer}>
        <nav className={styles.nav}>
          <ul>
            {/* Dashboard */}
            <li>
              <NavLink to="/dashboard" className={getLinkClassName('/dashboard')} onClick={() => onLinkClick('/dashboard')}>
                <span className={styles.iconPlaceholder}>📊</span>
                {!isCollapsed && <span className={styles.linkText}>Dashboard</span>}
              </NavLink>
            </li>

            {/* === Manage Inventory Section === */}
            {!isCollapsed && <li className={styles.menuHeader}>MANAGE INVENTORY</li>}

             {/* Admin Only Inventory Actions */}
             {isAdmin && (
               <>
                  <li> {/* Add Product */}
                      <NavLink to="/add-product" className={getLinkClassName('/add-product')} onClick={() => onLinkClick('/add-product')}>
                      <span className={styles.iconPlaceholder}>➕</span>
                      {!isCollapsed && <span className={styles.linkText}>Add product stock</span>}
                      </NavLink>
                  </li>
                  {/* Link to View Inventory page for editing */}
                  <li>
                      <NavLink to="/view-inventory" className={getLinkClassName('/view-inventory')} onClick={() => onLinkClick('/view-inventory')}>
                      <span className={styles.iconPlaceholder}>✏️</span>
                      {!isCollapsed && <span className={styles.linkText}>Edit Product Info</span>}
                      </NavLink>
                  </li>
                  <li> {/* Delete/Adjust Stock */}
                      <NavLink to="/delete-product" className={getLinkClassName('/delete-product')} onClick={() => onLinkClick('/delete-product')}>
                      <span className={styles.iconPlaceholder}>🗑️</span>
                      {!isCollapsed && <span className={styles.linkText}>Adjust/Remove Stock</span>}
                      </NavLink>
                  </li>
               </>
             )}

            {/* View Inventory (All Users) */}
            <li>
              <NavLink to="/view-inventory" className={getLinkClassName('/view-inventory')} onClick={() => onLinkClick('/view-inventory')}>
                 <span className={styles.iconPlaceholder}>👁️</span>
                 {!isCollapsed && <span className={styles.linkText}>View Inventory</span>}
              </NavLink>
            </li>

            {/* *** ADDED STOCK PREDICTION LINK (Admin Only Example) *** */}
             {isAdmin && (
                  <li>
                      <NavLink to="/stock-prediction" className={getLinkClassName('/stock-prediction')} onClick={() => onLinkClick('/stock-prediction')}>
                          <span className={styles.iconPlaceholder}>📈</span>
                          {!isCollapsed && <span className={styles.linkText}>Stock Prediction</span>}
                      </NavLink>
                  </li>
             )}

            {/* === Manage Invoice Section === */}
             {!isCollapsed && <li className={styles.menuHeader}>MANAGE INVOICE</li>}
             <li>
               <NavLink to="/generate-invoice" className={getLinkClassName('/generate-invoice')} onClick={() => onLinkClick('/generate-invoice')}>
                  <span className={styles.iconPlaceholder}>🧾</span>
                  {!isCollapsed && <span className={styles.linkText}>Generate Invoices</span>}
               </NavLink>
             </li>
             <li>
               <NavLink to="/view-invoices" className={getLinkClassName('/view-invoices')} onClick={() => onLinkClick('/view-invoices')}>
                  <span className={styles.iconPlaceholder}>📄</span>
                  {!isCollapsed && <span className={styles.linkText}>View Invoices</span>}
               </NavLink>
             </li>

             {/* === Manage Employees Section (Admin Only) === */}
             {isAdmin && (
                 <>
                     {!isCollapsed && <li className={styles.menuHeader}>MANAGE EMPLOYEES</li>}
                     <li>
                       <NavLink to="/add-employee" className={getLinkClassName('/add-employee')} onClick={() => onLinkClick('/add-employee')}>
                          <span className={styles.iconPlaceholder}>👤</span>
                          {!isCollapsed && <span className={styles.linkText}>Add employees</span>}
                       </NavLink>
                     </li>
                     <li>
                       <NavLink to="/view-employees" className={getLinkClassName('/view-employees')} onClick={() => onLinkClick('/view-employees')}>
                          <span className={styles.iconPlaceholder}>👥</span>
                          {!isCollapsed && <span className={styles.linkText}>View Employees</span>}
                       </NavLink>
                     </li>
                     <li>
                       <NavLink to="/view-employees" className={getLinkClassName('/view-employees')} onClick={() => onLinkClick('/view-employees')}>
                          <span className={styles.iconPlaceholder}>✏️</span>
                          {!isCollapsed && <span className={styles.linkText}>Edit employees info</span>}
                       </NavLink>
                     </li>
                 </>
              )}

              {/* === Reports Section (Admin Only) === */}
              {isAdmin && (
                  <>
                     {!isCollapsed && <li className={styles.menuHeader}>REPORTS</li>}
                      <li>
                        <NavLink to="/analytics" className={getLinkClassName('/analytics')} onClick={() => onLinkClick('/analytics')}>
                           <span className={styles.iconPlaceholder}>📈</span>
                           {!isCollapsed && <span className={styles.linkText}>View Analytics</span>}
                        </NavLink>
                      </li>
                  </>
              )}

               {/* === Logout Section === */}
              <li className={styles.logoutSection}>
                <NavLink to="/login" className={getLinkClassName('/login')} onClick={() => onLinkClick('/login')} >
                   <span className={styles.iconPlaceholder}>🚪</span>
                   {!isCollapsed && <span className={styles.linkText}>Logout</span>}
                </NavLink>
              </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;