import React, { useState, useEffect } from 'react';
// Import useLocation to read the current URL
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar'; // Adjust path if Sidebar is elsewhere
import styles from './MainLayout.module.css';

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation(); // Hook to get current location object
  // State to track the 'active' link path, initialized from current URL pathname
  const [activePath, setActivePath] = useState(location.pathname);

  // Effect to update activePath if the URL changes (e.g., browser back/forward)
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]); // Re-run when the pathname changes

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Function to be called by Sidebar links on click
  const handleLinkClick = (path) => {
    setActivePath(path);
  };

  return (
    <div className={`${styles.appContainer} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Pass NEW props: activePath and handleLinkClick */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        activePath={activePath}
        onLinkClick={handleLinkClick} // Pass the click handler function
      />
      <main className={`${styles.contentArea} ${isCollapsed ? styles.collapsed : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;