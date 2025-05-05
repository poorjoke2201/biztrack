import React, { useState, useEffect } from 'react';
//import MainLayout from '../../layouts/MainLayout/MainLayout';
import SalesChart from './SalesChart';
import styles from './AnalyticsPage.module.css';
import { getSalesData } from '../../services/analyticsService'; // Assuming you have this service

const AnalyticsPage = () => {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSalesData();
        setSalesData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load sales data.');
        setLoading(false);
        console.error('Error fetching sales data:', err);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return (
      //<MainLayout>
        <div className={styles.analyticsPage}>
          <h2>Analytics</h2>
          <p>Loading analytics data...</p>
        </div>
      //</MainLayout>
    );
  }

  if (error) {
    return (
      //<MainLayout>
        <div className={styles.analyticsPage}>
          <h2>Analytics</h2>
          <p className={styles.error}>{error}</p>
        </div>
      //</MainLayout>
    );
  }

  return (
    //<MainLayout>
      <div className={styles.analyticsPage}>
        <h2>Analytics</h2>
        {salesData && <SalesChart data={salesData} />}
        {/* You might add other charts or data displays here */}
      </div>
    //</MainLayout>
  );
};

export default AnalyticsPage;