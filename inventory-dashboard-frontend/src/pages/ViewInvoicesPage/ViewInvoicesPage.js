// src/pages/ViewInvoicesPage/ViewInvoicesPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import Table from '../../components/Table/Table';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { getAllInvoices, downloadInvoicePDF } from '../../services/invoiceService';
import styles from './ViewInvoicesPage.module.css';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ViewInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Only need one loading state
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const navigate = useNavigate();

  // Fetching Logic
  const fetchData = useCallback(async () => {
    console.log("Attempting to fetch invoices...");
    setLoading(true); // Set main loading true
    setError(null);
    setActionError(null);
    setActionSuccess(null);
    try {
      // Only fetch invoices here
      const data = await getAllInvoices();
      console.log("Invoices data received:", data);
      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        console.error("Received non-array data from getAllInvoices:", data);
        throw new Error('Invalid invoice data format received.');
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      const message = err.response?.data?.message || err.message || 'Failed to load invoices.';
      setError(message);
      setInvoices([]);
    } finally {
      setLoading(false); // Set main loading false
    }
  }, []); // No dependencies needed

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter Logic (remains the same)
  const filteredInvoices = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm) return invoices;
    return invoices.filter(invoice => {
        if (!invoice) return false;
        const formattedDate = invoice.createdAt ? formatDate(invoice.createdAt) : '';
        const customerMatch = invoice.customerName?.toLowerCase().includes(lowerCaseSearchTerm);
        const invoiceNumberMatch = invoice.invoiceNumber?.toLowerCase().includes(lowerCaseSearchTerm);
        const dateMatch = formattedDate.includes(lowerCaseSearchTerm);
        const totalMatch = invoice.grandTotal?.toString().includes(lowerCaseSearchTerm);
        const cashierMatch = invoice.createdBy?.name?.toLowerCase().includes(lowerCaseSearchTerm);
        return customerMatch || invoiceNumberMatch || dateMatch || totalMatch || cashierMatch;
    });
  }, [invoices, searchTerm]);

  // Handlers (remain the same)
  const handleViewDetails = useCallback((invoiceId) => {
    const targetPath = `/invoices/${invoiceId}`; // Points to route not yet defined in App.js
    console.log(`Navigating to view details (path TBD): ${targetPath}`);
    navigate(targetPath);
  }, [navigate]);

  const handleDownload = useCallback(async (invoiceId, invoiceNumber) => {
    setActionError(null);
    try { await downloadInvoicePDF(invoiceId); }
    catch (err) { setActionError(`Could not download PDF for ${invoiceNumber}.`); }
  }, []);

  // Define Columns (removing helper dependencies as per ESLint)
  const invoiceColumns = useMemo(() => [
    { header: 'Invoice #', key: 'invoiceNumber' },
    { header: 'Customer Name', key: 'customerName' },
    { header: 'Invoice Date', key: 'createdAt', format: (d) => formatDate(d) },
    { header: 'Total Amount', key: 'grandTotal', format: (v) => formatCurrency(v) },
    { header: 'Cashier', key: 'createdBy', render: (inv) => inv.createdBy?.name || 'N/A' },
    {
      header: 'Actions',
      key: 'actions',
      render: (invoice) => (
        <div className={styles.actionButtonsContainer}>
          <Button size="small" onClick={() => handleViewDetails(invoice._id)} title="View Invoice Details">View</Button>
          <Button size="small" variant="secondary" onClick={() => handleDownload(invoice._id, invoice.invoiceNumber)} title="Download PDF">Download</Button>
        </div>
      ),
    },
  ], [handleViewDetails, handleDownload]); // Removed formatCurrency, formatDate


  // Render Logic (remains the same)
  if (loading) return <div className={styles.viewInvoicesPage}><h2>View Invoices</h2><Spinner message="Loading invoices..." /></div>;
  if (error) return <div className={styles.viewInvoicesPage}><h2>View Invoices</h2><Alert type="error" message={error} /></div>;

  return (
    <div className={styles.viewInvoicesPage}>
      <h2>View Invoices</h2>
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}
      {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess(null)} />}
      <SearchBar onSearch={setSearchTerm} placeholder="Search Invoices..." />
      <Table columns={invoiceColumns} data={filteredInvoices} />
      {!loading && filteredInvoices.length === 0 && searchTerm && (<p className={styles.noResults}>No invoices found matching "{searchTerm}".</p>)}
      {!loading && invoices.length > 0 && filteredInvoices.length === 0 && !searchTerm && (<p className={styles.noResults}>No invoices match the current filter.</p>)}
      {!loading && invoices.length === 0 && !error && (<p className={styles.noResults}>No invoices generated yet.</p>)}
    </div>
  );
};

export default ViewInvoicesPage;