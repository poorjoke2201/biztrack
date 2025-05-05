import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
//import MainLayout from '../../layouts/MainLayout/MainLayout';
import SearchBar from '../../components/SearchBar/SearchBar';
import Table from '../../components/Table/Table';
import styles from './ViewInvoicesPage.module.css';
import { getAllInvoices } from '../../services/invoiceService';
import Spinner from '../../components/Spinner/Spinner'; // Assuming components exist
import Alert from '../../components/Alert/Alert';    // Assuming components exist

const ViewInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  // --- Fetch Invoices ---
  useEffect(() => {
    let isMounted = true;
    const fetchInvoices = async () => {
      console.log("Attempting to fetch invoices...");
      setLoading(true);
      setError(null);
      try {
        const data = await getAllInvoices();
        console.log("Invoices data received:", data);
        if (isMounted) {
            if (Array.isArray(data)) {
                setInvoices(data);
            } else {
                console.error("Received non-array data from getAllInvoices:", data);
                setError('Failed to load invoices: Invalid data format received.');
                setInvoices([]);
            }
            setLoading(false);
        }
      } catch (err) {
         if (isMounted) {
            console.error('Error fetching invoices:', err);
            const message = err.response?.data?.message || err.message || 'Failed to load invoices due to a network or server error.';
            setError(message);
            setLoading(false);
            setInvoices([]);
         }
      }
    };
    fetchInvoices();
    return () => { isMounted = false; } // Cleanup
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // --- Filter Logic (using corrected field names: _id, createdAt) ---
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  const filteredInvoices = invoices.filter(invoice => {
     if (!invoice) return false;

     // Format date for searching (e.g., YYYY-MM-DD)
     const formattedDate = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-CA') : ''; // 'en-CA' gives YYYY-MM-DD

     // Safe checks
     const customerMatch = invoice.customerName && typeof invoice.customerName === 'string' && invoice.customerName.toLowerCase().includes(lowerCaseSearchTerm);
     const dateMatch = formattedDate.includes(searchTerm); // Search original term in formatted date
     const totalMatch = invoice.totalAmount !== undefined && invoice.totalAmount !== null && invoice.totalAmount.toString().includes(searchTerm);
     const idMatch = invoice._id && typeof invoice._id === 'string' && invoice._id.toLowerCase().includes(lowerCaseSearchTerm); // Use _id

     return customerMatch || dateMatch || totalMatch || idMatch;
  });

   // --- View Handler ---
  const handleView = (invoiceId) => {
    console.log(`Navigating to view page for invoice: ${invoiceId}`);
    // Define a route like /view-invoice/:invoiceId in your App.js
    navigate(`/view-invoice/${invoiceId}`);
  };

  // --- Define Columns (using corrected field names and formatting) ---
  const invoiceColumns = [
    // Use _id, maybe shorten it or link it
    { header: 'Invoice ID', key: '_id', format: (id) => id ? `${id.substring(0, 8)}...` : 'N/A' }, // Example: shorten ID
    { header: 'Customer Name', key: 'customerName' },
    // Use createdAt and format it
    {
      header: 'Invoice Date',
      key: 'createdAt',
      format: (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A' // Format date nicely
    },
    { header: 'Total Amount', key: 'totalAmount', format: (value) => value != null ? `₹${Number(value).toFixed(2)}` : 'N/A' },
    // Display who created it, using populated data
    { header: 'Created By', key: 'createdBy', format: (user) => user?.name || 'N/A' }, // Access populated user name
    {
      header: 'Actions',
      key: 'actions',
      render: (invoice) => (
        <div className={styles.actionButtonsContainer}>
          {/* Call handleView */}
          <button title="View Invoice Details" className={styles.actionButton} onClick={() => handleView(invoice._id)}>View</button>
          {/* Optionally add delete or other actions later */}
        </div>
      ),
    },
  ];

  // --- Render Logic ---
  if (loading) {
    return (
      //<MainLayout>
        <div className={styles.viewInvoicesPage}>
          <h2>View Invoices</h2>
          <Spinner />
          <p>Loading invoices...</p>
        </div>
      //</MainLayout>
    );
  }

  if (error) {
    return (
      //<MainLayout>
        <div className={styles.viewInvoicesPage}>
          <h2>View Invoices</h2>
          <Alert type="error" message={error} />
        </div>
      //</MainLayout>
    );
  }

  return (
    //<MainLayout>
      <div className={styles.viewInvoicesPage}>
        <h2>View Invoices</h2>
        <SearchBar onSearch={handleSearch} placeholder="Search by Customer, Date (YYYY-MM-DD), Amount, ID..." />
        <Table columns={invoiceColumns} data={filteredInvoices} />
        {/* Empty state messages */}
        {filteredInvoices.length === 0 && searchTerm && (
           <p className={styles.noResults}>No invoices found matching "{searchTerm}".</p>
        )}
         {invoices.length > 0 && filteredInvoices.length === 0 && !searchTerm && (
           <p className={styles.noResults}>No invoices match the current filter.</p>
        )}
         {invoices.length === 0 && !error && (
             <p className={styles.noResults}>No invoices have been generated yet.</p>
         )}
      </div>
    //</MainLayout>
  );
};

export default ViewInvoicesPage;