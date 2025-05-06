// src/layouts/MainLayout/MainLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar'; // Adjust path if Sidebar is elsewhere
// *** REMOVE Navbar IMPORT ***
// import Navbar from '../../components/Navbar/Navbar';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLinkClick = (path) => {
    setActivePath(path);
  };

  return (
    // Main container for the entire app screen after login
    // The structure is now simpler: just the mainBodyContainer
    <div className={`${styles.mainBodyContainer} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
      {/* *** Navbar Component REMOVED from here *** */}

      {/* Sidebar is directly a child of the main container now, or mainBodyContainer handles flex */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        activePath={activePath}
        onLinkClick={handleLinkClick}
      />
      <main className={`${styles.contentArea} ${isCollapsed ? styles.contentAreaCollapsed : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;