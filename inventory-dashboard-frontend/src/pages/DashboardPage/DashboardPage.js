import React, { useState, useEffect } from 'react';
import styles from './DashboardPage.module.css'; // Styles for page layout
// Assuming MainLayout handles Sidebar/Navbar
// import MainLayout from '../../layouts/MainLayout/MainLayout';
import { useAuth } from '../../context/AuthContext'; // Assuming this exists and works now
import StatCard from './StatCard'; // StatCard is in the SAME folder
import InfoListCard from '../../components/InfoListCard/InfoListCard'; // InfoListCard is in components
// import { getDashboardData } from '../../services/analyticsService'; // Keep for API call

const DashboardPage = () => {
  const { user } = useAuth(); // Get user from context
  const [stats, setStats] = useState({ // State for stats data
    totalProducts: 0,
    outOfStock: 0,
  });
  const [topSelling, setTopSelling] = useState([]);
  const [lowSelling, setLowSelling] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        // const data = await getDashboardData();
        // setStats({ totalProducts: data.totalProducts, outOfStock: data.productsOutOfStock });
        // setTopSelling(data.topSellingProducts);
        // setLowSelling(data.lowestSellingProducts);
        // setAlerts(data.currentAlerts);

        // --- Mock Data Implementation (matches images) ---
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setStats({ totalProducts: 125, outOfStock: 8 });
        setTopSelling([
            { id: "prod101", name: "Organic Apples" },
            { id: "prod205", name: "Whole Wheat Bread" },
            { id: "prod310", name: "Milk (Gallon)" },
            { id: "prod102", name: "Bananas" },
            { id: "prod401", name: "Cheddar Cheese Block" },
        ]);
        setLowSelling([
            { id: "prod801", name: "Imported Truffle Oil" },
            { id: "prod750", name: "Artisan Sourdough" },
            { id: "prod911", name: "Quinoa Flour" },
            // Add more if needed for "Top 5"
            { id: "prod912", name: "Luxury Dog Biscuits" },
            { id: "prod913", name: "Edible Glitter" },
        ]);
        setAlerts([
           "Low stock warning: Organic Apples",
           "New order received: #12346",
           "Invoice #INV-002 payment received",
       ]);
       // --- End Mock Data ---

        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

  // Optional: Show loading spinner component
  if (loading) {
    return (
      // <MainLayout>
        <div className={styles.messageContainer}>
          <p>Loading dashboard...</p>
          {/* You could add your Spinner component here */}
        </div>
      // </MainLayout>
    );
  }

  if (error) {
    return (
       // <MainLayout>
         <div className={styles.messageContainer}>
           <p className={styles.error}>{error}</p>
         </div>
       // </MainLayout>
    );
  }

  // Determine display name
  const displayName = user?.name || user?.email || 'User';

  return (
    // Assuming MainLayout provides the overall structure with Sidebar
    // <MainLayout>
      <div className={styles.dashboardContainer}>
        {/* Welcome Message */}
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Hello, {displayName}!
          </h1>
          <p className={styles.welcomeSubtitle}>
            Your stock summaries all in one place.
          </p>
        </div>

        {/* Analytics Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Analytics at a glance</h2>
          <p className={styles.placeholderText}>[Graphs and detailed charts will be displayed here, fetched from analytics data.]</p>

          {/* Grid for Stats and Lists */}
          <div className={styles.gridContainer}>
            {/* Use StatCard component */}
            <StatCard value={stats.totalProducts} label="Count of all the products" />
            <StatCard value={stats.outOfStock} label="Products out of stock" />

            {/* Use InfoListCard component */}
            <InfoListCard
                title="Top 5 highest selling products"
                items={topSelling.slice(0, 5)} // Ensure max 5 items
                baseLinkPath="/product-details/" // TODO: Adjust link path
                emptyMessage="No top selling products found."
            />
            <InfoListCard
                title="Top 5 lowest selling products"
                items={lowSelling.slice(0, 5)} // Ensure max 5 items
                baseLinkPath="/product-details/" // TODO: Adjust link path
                emptyMessage="No low selling products found."
             />
          </div>
        </section>

        {/* Alerts Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Alerts</h2>
           <div className={styles.alertsContainer}>
             {alerts.length > 0 ? (
                 alerts.map((alert, index) => (
                     <div key={index} className={styles.alertItem}>{alert}</div>
                 ))
             ) : (
                 <p className={styles.placeholderText}>No current alerts.</p>
             )}
           </div>
        </section>
      </div>
    // </MainLayout>
  );
};

export default DashboardPage;