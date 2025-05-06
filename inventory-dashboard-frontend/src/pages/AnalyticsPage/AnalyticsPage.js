// src/pages/AnalyticsPage/AnalyticsPage.js
import React, { useState, useEffect } from 'react';
import SalesChart from './SalesChart'; // Assuming this component exists and accepts data prop
import styles from './AnalyticsPage.module.css';
// Import CORRECTED function names from analyticsService
import {
    
    getAnalyticsDetails // Fetch the combined details data
} from '../../services/analyticsService';
// Assuming you have these common components - adjust paths if needed
import LoadingSpinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
// Assuming helper exists - adjust path if needed
import { formatDate } from '../../utils/helpers';

const AnalyticsPage = () => {
  // Combined state for fetched analytics data
  const [analyticsData, setAnalyticsData] = useState({
      salesTrend: [],
      topProductsChart: [],
      revenueSummary: null,
      recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the combined details data which includes most things
        const detailsData = await getAnalyticsDetails();
        setAnalyticsData(detailsData || { // Ensure we have a default object structure
             salesTrend: [],
             topProductsChart: [],
             revenueSummary: null,
             recentInvoices: [],
        });

      } catch (err) {
        const errorMsg = 'Failed to load analytics data.';
        setError(errorMsg);
        console.error(errorMsg, err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []); // Run once on mount

  if (loading) {
    return (
      <div className={styles.analyticsPage}>
        <h2>Analytics</h2>
        <LoadingSpinner message="Loading analytics data..." /> {/* Use Spinner Component */}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.analyticsPage}>
        <h2>Analytics</h2>
        <Alert type="error" message={error} /> {/* Use Alert Component */}
      </div>
    );
  }

  // Ensure data exists before trying to render charts/components
  if (!analyticsData) {
       return (
         <div className={styles.analyticsPage}>
            <h2>Analytics</h2>
            <p>No analytics data available.</p>
         </div>
       );
  }

  // Helper to format currency (or import from utils)
  const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  return (
      <div className={styles.analyticsPage}>
        <h2>Analytics</h2>

        {/* Revenue Summary Section */}
        {analyticsData.revenueSummary && (
            <section className={styles.summarySection}>
                <h3>Revenue Summary</h3>
                <div className={styles.revenueGrid}>
                     {/* Use StatCard or similar components if available */}
                     <div className={styles.summaryCard}>Today: <span className={styles.revenueValue}>{formatCurrency(analyticsData.revenueSummary.today)}</span></div>
                     <div className={styles.summaryCard}>This Month: <span className={styles.revenueValue}>{formatCurrency(analyticsData.revenueSummary.thisMonth)}</span></div>
                     <div className={styles.summaryCard}>All Time: <span className={styles.revenueValue}>{formatCurrency(analyticsData.revenueSummary.allTime)}</span></div>
                </div>
            </section>
        )}

        {/* Sales Trend Section */}
        {analyticsData.salesTrend && analyticsData.salesTrend.length > 0 && (
            <section className={styles.chartSection}>
                <h3>Sales Trend (Last 12 Months)</h3>
                <SalesChart data={analyticsData.salesTrend} />
            </section>
        )}

        {/* Top Selling Products Section */}
        {analyticsData.topProductsChart && analyticsData.topProductsChart.length > 0 && (
            <section className={styles.listSection}>
                <h3>Top Selling Products (Units - Last 90 Days)</h3>
                {/* Render Pie Chart component here if you have one */}
                {/* <TopProductsPieChart data={analyticsData.topProductsChart} /> */}
                <ul className={styles.productList}>
                    {analyticsData.topProductsChart.map((p, i) => (
                        <li key={p.name + i}>{i + 1}. {p.name} ({p.quantitySold} units sold)</li>
                    ))}
                </ul>
            </section>
        )}

         {/* Recent Invoices Section */}
         {analyticsData.recentInvoices && analyticsData.recentInvoices.length > 0 && (
            <section className={styles.tableSection}>
                 <h3>Recent Invoices</h3>
                 {/* Assuming you have a reusable Table component or style one here */}
                 <table className={styles.invoiceTable}>
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Cashier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analyticsData.recentInvoices.map(inv => (
                            <tr key={inv._id}>
                                <td>{inv.invoiceNumber}</td>
                                <td>{inv.customerName}</td>
                                <td>{formatDate(inv.createdAt)}</td> {/* Use formatDate helper */}
                                <td>{formatCurrency(inv.grandTotal)}</td>
                                <td>{inv.createdBy?.name || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
         )}

        {/* Add other sections/charts based on analyticsDetails */}

      </div>
  );
};

export default AnalyticsPage;