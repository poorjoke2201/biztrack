// src/pages/AnalyticsPage/AnalyticsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SalesChart from './SalesChart'; // Import the SalesChart component
import styles from './AnalyticsPage.module.css';
import { getAnalyticsDetails } from '../../services/analyticsService';
import LoadingSpinner from '../../components/Spinner/Spinner'; // Adjust path if needed
import Alert from '../../components/Alert/Alert';             // Adjust path if needed
import { formatDate, formatCurrency } from '../../utils/helpers'; // Adjust path if needed

// --- Pie Chart Component for Top Products (can be moved to its own file) ---
import { Pie } from 'react-chartjs-2';
// Chart.js core and necessary elements are registered in SalesChart.js

const TopProductsPieChart = ({ data, title = "Top Selling Products (Units)" }) => {
  if (!data || data.length === 0) {
    return <p className={styles.placeholderText}>No top products data for pie chart.</p>;
  }

  const chartData = {
    labels: data.map(p => p.name), // Product names
    datasets: [
      {
        label: 'Units Sold',
        data: data.map(p => p.quantitySold), // Quantity sold
        backgroundColor: [
          'rgba(20, 184, 166, 0.7)',  // Teal
          'rgba(59, 130, 246, 0.7)',  // Blue
          'rgba(234, 179, 8, 0.7)',   // Yellow
          'rgba(249, 115, 22, 0.7)',  // Orange
          'rgba(139, 92, 246, 0.7)',  // Violet
          'rgba(236, 72, 153, 0.7)',  // Pink
        ],
        borderColor: [ // Corresponding border colors
          'rgba(20, 184, 166, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // Better for pie charts sometimes
         labels: {
            font: { size: 12 },
            boxWidth: 20,
            padding: 15
        }
      },
      title: {
        display: true,
        text: title,
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 20 }
      },
      tooltip: {
         callbacks: {
            label: function(context) {
                let label = context.label || '';
                if (label) { label += ': '; }
                if (context.parsed !== null) { label += context.parsed + ' units'; }
                return label;
            }
         }
      }
    },
  };

  // Set a max-width for pie chart for better appearance
  return (
    <div style={{ position: 'relative', height: '350px', width: '100%', maxWidth: '450px', margin: 'auto' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};
// --- END Pie Chart Component ---


const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true); setError(null);
      try {
        const detailsData = await getAnalyticsDetails();
        console.log("AnalyticsPage Data:", detailsData);
        setAnalyticsData(detailsData);
      } catch (err) {
        setError('Failed to load analytics data.');
        console.error('Error fetching analytics data:', err);
      } finally { setLoading(false); }
    };
    fetchAnalyticsData();
  }, []);

  if (loading) return <div className={styles.analyticsPage}><h2>Analytics</h2><LoadingSpinner message="Loading analytics data..." /></div>;
  if (error) return <div className={styles.analyticsPage}><h2>Analytics</h2><Alert type="error" message={error} /></div>;
  if (!analyticsData) return <div className={styles.analyticsPage}><h2>Analytics</h2><p>No analytics data available.</p></div>;

  const { salesTrend, topProductsChart, revenueSummary, recentInvoices } = analyticsData;

  return (
    <div className={styles.analyticsPage}>
      <h2 className={styles.pageTitle}>Business Analytics</h2>

      {/* Revenue Summary Section */}
      {revenueSummary && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Revenue Snapshot</h3>
          <div className={styles.revenueGrid}>
            <div className={styles.summaryCard}>Today: <span className={styles.revenueValue}>{formatCurrency(revenueSummary.today)}</span></div>
            <div className={styles.summaryCard}>This Month: <span className={styles.revenueValue}>{formatCurrency(revenueSummary.thisMonth)}</span></div>
            <div className={styles.summaryCard}>All Time: <span className={styles.revenueValue}>{formatCurrency(revenueSummary.allTime)}</span></div>
          </div>
        </section>
      )}

      {/* Sales Trend Section */}
      <section className={`${styles.section} ${styles.chartContainer}`}>
        <SalesChart data={salesTrend || []} title="Sales Revenue Over Time (Last 12 Months)" />
      </section>

      {/* Top Selling Products Chart Section */}
      <section className={`${styles.section} ${styles.chartContainer}`}>
        <TopProductsPieChart data={topProductsChart || []} title="Top 5 Selling Products (Units - Last 90 Days)" />
      </section>

      {/* Recent Invoices Table Section */}
      {recentInvoices && recentInvoices.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Invoices (Last 20)</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
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
                {recentInvoices.map(inv => (
                  <tr key={inv._id}>
                    <td><Link to={`/invoices/${inv._id}`}>{inv.invoiceNumber}</Link></td>
                    <td>{inv.customerName}</td>
                    <td>{formatDate(inv.createdAt)}</td>
                    <td className={styles.amountCell}>{formatCurrency(inv.grandTotal)}</td>
                    <td>{inv.createdBy?.name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AnalyticsPage;