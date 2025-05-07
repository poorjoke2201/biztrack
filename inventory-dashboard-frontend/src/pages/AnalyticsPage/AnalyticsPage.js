// src/pages/AnalyticsPage/AnalyticsPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Import necessary hooks
import { Link } from 'react-router-dom';
import SalesChart from './SalesChart'; // Assuming SalesChart is in the same folder
import styles from './AnalyticsPage.module.css'; // Import styles
import { getAnalyticsDetails } from '../../services/analyticsService'; // Import the correct service function
import LoadingSpinner from '../../components/Spinner/Spinner'; // Import Spinner (adjust path if needed)
import Alert from '../../components/Alert/Alert';             // Import Alert (adjust path if needed)
import Button from '../../components/Button/Button';           // Import Button (adjust path if needed)
import { formatDate, formatCurrency } from '../../utils/helpers'; // Import helpers (adjust path if needed)

// --- Pie Chart Component for Top Products (can be moved to its own file) ---
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables); // Register Chart.js components

const TopProductsPieChart = ({ data, title = "Top Selling Products (Units)" }) => {
  if (!data || data.length === 0) {
    return <p className={styles.placeholderText}>No top products data available.</p>;
  }
  const chartData = {
    labels: data.map(p => p.name),
    datasets: [{
      label: 'Units Sold',
      data: data.map(p => p.quantitySold),
      backgroundColor: ['rgba(20, 184, 166, 0.7)','rgba(59, 130, 246, 0.7)','rgba(234, 179, 8, 0.7)','rgba(249, 115, 22, 0.7)','rgba(139, 92, 246, 0.7)','rgba(236, 72, 153, 0.7)'],
      borderColor: ['rgba(20, 184, 166, 1)','rgba(59, 130, 246, 1)','rgba(234, 179, 8, 1)','rgba(249, 115, 22, 1)','rgba(139, 92, 246, 1)','rgba(236, 72, 153, 1)'],
      borderWidth: 1,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { font: { size: 12 }, boxWidth: 20, padding: 15 } },
      title: { display: true, text: title, font: { size: 16, weight: '500' }, padding: { top: 10, bottom: 15 } }, // Adjusted font
      tooltip: { callbacks: { label: function(context) { return `${context.label || ''}: ${context.parsed || 0} units`; } } }
    },
  };
  return <div className={styles.pieChartContainer}><Pie data={chartData} options={options} /></div>; // Added style class
};
// --- END Pie Chart Component ---


// --- Main Analytics Page Component ---
const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- State for Time Range Filter ---
  const [selectedRangeKey, setSelectedRangeKey] = useState('1Y'); // Default

  // Define Time Range Options using useMemo
  const TIME_RANGE_OPTIONS = useMemo(() => ({
    '7D': 'Last 7 Days', '1M': 'Last Month', '6M': 'Last 6 Months',
    '1Y': 'Last Year', 'ALL': 'All Time',
  }), []);

  // Function to calculate date range based on selected key
  const calculateDateRange = useCallback((rangeKey) => {
    const today = new Date(); let startDate = null; const endDate = today.toISOString().split('T')[0]; const now = new Date();
    switch (rangeKey) { case '7D': startDate = new Date(now.setDate(now.getDate() - 6)); break; case '1M': startDate = new Date(now.setMonth(now.getMonth() - 1)); break; case '6M': startDate = new Date(now.setMonth(now.getMonth() - 6)); break; case '1Y': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break; case 'ALL': default: startDate = null; break; }
    const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : null;
    return rangeKey === 'ALL' ? { startDate: null, endDate: null } : { startDate: formattedStartDate, endDate: endDate };
  }, []);

  // Fetch Data based on selectedRangeKey
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { startDate, endDate } = calculateDateRange(selectedRangeKey);
      console.log(`Fetching analytics for range: ${selectedRangeKey}`, { startDate, endDate });
      // Use getAnalyticsDetails which includes sales trend for the specified range
      const detailsData = await getAnalyticsDetails(startDate, endDate);
      console.log("AnalyticsPage Data Received:", detailsData);
      setAnalyticsData(detailsData);
    } catch (err) {
      setError('Failed to load analytics data.'); console.error('Error fetching analytics data:', err); setAnalyticsData(null);
    } finally { setLoading(false); }
  }, [selectedRangeKey, calculateDateRange]); // Dependencies

  // Trigger fetch on initial mount and when fetch function reference changes
  useEffect(() => { fetchAnalyticsData(); }, [fetchAnalyticsData]);

  // Handler for changing time range
  const handleRangeChange = (rangeKey) => { setSelectedRangeKey(rangeKey); };


  // --- Render Logic ---
  if (loading && !analyticsData) return <div className={styles.analyticsPage}><h2>Analytics</h2><LoadingSpinner message="Loading analytics data..." /></div>;
  if (error && !analyticsData) return <div className={styles.analyticsPage}><h2>Analytics</h2><Alert type="error" message={error} /></div>;
  // Render placeholder even if analyticsData is null briefly during loading
  if (!analyticsData && !loading) return <div className={styles.analyticsPage}><h2>Analytics</h2><p>No analytics data available.</p></div>;

  // Destructure data with defaults AFTER checking analyticsData exists
  const { salesTrend = [], topProductsChart = [], revenueSummary, recentInvoices = [] } = analyticsData || {};

  return (
    <div className={styles.analyticsPage}>
      <h2 className={styles.pageTitle}>Business Analytics</h2>
      {/* Display error during refresh if needed */}
      {error && loading && <Alert type="warning" message={`Failed to refresh data: ${error}`} />}

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

      {/* Sales Trend Section with Time Range Filters */}
      <section className={`${styles.section} ${styles.chartContainer}`}>
         <div className={styles.chartHeader}>
            <h3 className={styles.sectionTitle}>Sales Revenue Over Time</h3>
            {/* Time Range Buttons */}
            <div className={styles.timeRangeButtons}>
                {Object.entries(TIME_RANGE_OPTIONS).map(([key, label]) => (
                    <Button
                        key={key}
                        onClick={() => handleRangeChange(key)}
                        variant={selectedRangeKey === key ? 'primary' : 'outline'} // Highlight active
                        size="small"
                        disabled={loading} // Disable during loading
                    >
                        {label}
                    </Button>
                ))}
            </div>
            {/* Show spinner next to buttons ONLY during actual loading */}
            {loading && <LoadingSpinner size="small" inline={true} />}
         </div>
         {/* Sales Chart Component */}
         <SalesChart data={salesTrend} title={`Sales Revenue (${TIME_RANGE_OPTIONS[selectedRangeKey]})`} />
      </section>

      {/* Top Selling Products Chart Section */}
      <section className={`${styles.section} ${styles.chartContainer}`}>
        <TopProductsPieChart data={topProductsChart} title="Top 5 Selling Products (Units - Last 90 Days)" />
      </section>

      {/* Recent Invoices Table Section */}
      {recentInvoices && recentInvoices.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Invoices</h3>
          <div className={styles.tableWrapper}>
            {/* Ensure you have styles for dataTable etc. */}
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
       {/* Message if no recent invoices */}
      {recentInvoices.length === 0 && !loading && (
          <section className={styles.section}><p>No recent invoices to display.</p></section>
       )}
    </div>
  );
};

export default AnalyticsPage;