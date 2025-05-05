import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
// TODO: Import icons

// Accept activePath and onLinkClick props from MainLayout
const Sidebar = ({ isCollapsed, toggleSidebar, activePath, onLinkClick }) => {

  // Helper function to determine the className
  const getLinkClassName = (path) => {
    // Check if the manually tracked activePath matches this link's path
    return activePath === path ? styles.active : undefined;
  };

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
        {!isCollapsed && <span className={styles.logoText}>BizTrack</span>}
        <button onClick={toggleSidebar} className={styles.toggleButton}>
           ☰ {/* Replace with icon */}
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <ul>
          {/* Dashboard */}
          <li>
             {/* Use manual className, add onClick */}
            <NavLink to="/dashboard" className={getLinkClassName('/dashboard')} onClick={() => onLinkClick('/dashboard')}>
              <span className={styles.iconPlaceholder}>📊</span>
              {!isCollapsed && <span className={styles.linkText}>Dashboard</span>}
            </NavLink>
          </li>

          {/* === Manage Inventory Section === */}
          {!isCollapsed && <li className={styles.menuHeader}>MANAGE INVENTORY</li>}

          <li> {/* Add Product */}
             {/* Use manual className, add onClick */}
            <NavLink to="/add-product" className={getLinkClassName('/add-product')} onClick={() => onLinkClick('/add-product')}>
              <span className={styles.iconPlaceholder}>➕</span>
              {!isCollapsed && <span className={styles.linkText}>Add product stock</span>}
            </NavLink>
          </li>
          <li> {/* View Inventory */}
             {/* Use manual className, add onClick */}
            <NavLink to="/view-inventory" className={getLinkClassName('/view-inventory')} onClick={() => onLinkClick('/view-inventory')}>
               <span className={styles.iconPlaceholder}>👁️</span>
               {!isCollapsed && <span className={styles.linkText}>View Inventory</span>}
            </NavLink>
          </li>
           <li> {/* Edit Product Info - Still links to View Inventory */}
             {/* Use manual className, add onClick */}
             {/* We set the active path to '/view-inventory#edit' or similar if we need distinction */}
             {/* Simple approach: highlight based on its OWN intended path conceptually */}
             {/* More complex: highlight based on parent '/view-inventory' */}
             {/* Let's try highlighting it based on '/view-inventory' click */}
            <NavLink to="/view-inventory" className={getLinkClassName('/view-inventory')} onClick={() => onLinkClick('/view-inventory')}>
               <span className={styles.iconPlaceholder}>✏️</span>
               {!isCollapsed && <span className={styles.linkText}>Edit Product Info</span>}
            </NavLink>
          </li>
          <li> {/* Delete Stock */}
            {/* Use manual className, add onClick */}
            <NavLink to="/delete-product" className={getLinkClassName('/delete-product')} onClick={() => onLinkClick('/delete-product')}>
               <span className={styles.iconPlaceholder}>🗑️</span>
               {!isCollapsed && <span className={styles.linkText}>Delete Stock</span>}
            </NavLink>
          </li>


          {/* === Manage Invoice Section === */}
           {!isCollapsed && <li className={styles.menuHeader}>MANAGE INVOICE</li>}
           <li>
             {/* Use manual className, add onClick */}
             <NavLink to="/generate-invoice" className={getLinkClassName('/generate-invoice')} onClick={() => onLinkClick('/generate-invoice')}>
                <span className={styles.iconPlaceholder}>🧾</span>
                {!isCollapsed && <span className={styles.linkText}>Generate Invoices</span>}
             </NavLink>
           </li>
           <li>
             {/* Use manual className, add onClick */}
             <NavLink to="/view-invoices" className={getLinkClassName('/view-invoices')} onClick={() => onLinkClick('/view-invoices')}>
                <span className={styles.iconPlaceholder}>📄</span>
                {!isCollapsed && <span className={styles.linkText}>View Invoices</span>}
             </NavLink>
           </li>

           {/* === Manage Employees Section === */}
           {!isCollapsed && <li className={styles.menuHeader}>MANAGE EMPLOYEES</li>}

           <li> {/* Add Employee */}
             {/* Use manual className, add onClick */}
             <NavLink to="/add-employee" className={getLinkClassName('/add-employee')} onClick={() => onLinkClick('/add-employee')}>
                <span className={styles.iconPlaceholder}>👤</span>
                {!isCollapsed && <span className={styles.linkText}>Add employees</span>}
             </NavLink>
           </li>
           <li> {/* View Employees */}
             {/* Use manual className, add onClick */}
             <NavLink to="/view-employees" className={getLinkClassName('/view-employees')} onClick={() => onLinkClick('/view-employees')}>
                <span className={styles.iconPlaceholder}>👥</span>
                {!isCollapsed && <span className={styles.linkText}>View Employees</span>}
             </NavLink>
           </li>
            <li> {/* Edit employees info - Links to View Employees */}
             {/* Use manual className, add onClick */}
             <NavLink to="/view-employees" className={getLinkClassName('/view-employees')} onClick={() => onLinkClick('/view-employees')}>
                <span className={styles.iconPlaceholder}>✏️</span>
                {!isCollapsed && <span className={styles.linkText}>Edit employees info</span>}
             </NavLink>
           </li>


            {/* === Reports Section === */}
           {!isCollapsed && <li className={styles.menuHeader}>REPORTS</li>}
            <li>
              {/* Use manual className, add onClick */}
              <NavLink to="/analytics" className={getLinkClassName('/analytics')} onClick={() => onLinkClick('/analytics')}>
                 <span className={styles.iconPlaceholder}>📈</span>
                 {!isCollapsed && <span className={styles.linkText}>View Analytics</span>}
              </NavLink>
            </li>

             {/* === Logout Section === */}
            <li className={styles.logoutSection}>
              {/* Logout usually performs an action AND navigates */}
              {/* TODO: onClick should call context logout *then* handleLinkClick */}
              <NavLink to="/login" className={getLinkClassName('/login')} onClick={() => onLinkClick('/login')} >
                 <span className={styles.iconPlaceholder}>🚪</span>
                 {!isCollapsed && <span className={styles.linkText}>Logout</span>}
              </NavLink>
            </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;