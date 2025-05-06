// src/pages/ViewInvoiceDetailsPage/ViewInvoiceDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Link removed as it's unused
// TODO: Remove MainLayout import if App.js already provides it via Outlet
// import MainLayout from '../../layouts/MainLayout/MainLayout';
import styles from './ViewInvoiceDetailsPage.module.css';
import { getInvoiceById, downloadInvoicePDF } from '../../services/invoiceService'; // Add download service
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button'; // Import Button
// Assuming helpers exist - create if needed
import { formatDate, formatCurrency } from '../../utils/helpers';

const ViewInvoiceDetailsPage = () => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(''); // For download error
    const { invoiceId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const fetchInvoice = async () => {
            console.log(`Attempting to fetch invoice with ID: ${invoiceId}`);
            setLoading(true);
            setError(null);
            setInvoice(null);
            try {
                const data = await getInvoiceById(invoiceId);
                console.log("Invoice details received:", data);
                if (isMounted) {
                    if (data && data._id) { // Basic check for valid data
                        setInvoice(data);
                    } else {
                        // Handle cases where API returns success but no data (e.g., 404 handled)
                        setError(`Invoice with ID ${invoiceId} not found.`);
                    }
                }
            } catch (err) {
                 if (isMounted) {
                    console.error("Error fetching invoice details:", err);
                    setError(err.response?.data?.message || err.message || "Failed to load invoice details.");
                 }
            } finally {
               if (isMounted) setLoading(false);
            }
        };

        // Validate ID format before fetching (basic check)
        // Mongoose ObjectId is 24 hex characters
        if (invoiceId && /^[a-f\d]{24}$/i.test(invoiceId)) {
            fetchInvoice();
        } else {
            console.error("Invalid Invoice ID format provided in URL:", invoiceId);
            setError("Invalid Invoice ID format in URL.");
            setLoading(false);
        }

        return () => { isMounted = false; };
    }, [invoiceId]); // Depend on invoiceId

     // --- Download Handler ---
     const handleDownload = async () => {
        setActionError(''); // Clear previous error
        if (!invoice) return;
        try {
            await downloadInvoicePDF(invoice._id);
        } catch (err) {
             // Service should ideally handle user alert, log here
             console.error("Error triggering PDF download:", err);
             setActionError("Failed to download PDF.");
        }
    };

    // --- Render Logic ---

    // Loading State
    if (loading) {
        return (
            // Remove MainLayout if rendered by parent route
            <div className={styles.detailsPage}>
                <h2>Invoice Details</h2>
                <Spinner message="Loading invoice details..." />
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className={styles.detailsPage}>
                <h2>Invoice Details</h2>
                <Alert type="error" message={error} />
                <Button className={styles.backButton} onClick={() => navigate('/view-invoices')} variant="secondary">
                    Back to Invoices
                </Button>
            </div>
        );
    }

    // Invoice Not Found (after loading, no error, but invoice is null)
    if (!invoice) {
         return (
            <div className={styles.detailsPage}>
                 <h2>Invoice Details</h2>
                 <Alert type="warning" message={`Invoice data not found (ID: ${invoiceId}).`} />
                 <Button className={styles.backButton} onClick={() => navigate('/view-invoices')} variant="secondary">
                     Back to Invoices
                 </Button>
            </div>
         );
    }

    // --- Success State: Display Invoice Details ---
    return (
        // Remove MainLayout if rendered by parent route
        <div className={styles.detailsPage}>
            {/* Use Invoice Number from data */}
            <div className={styles.pageHeader}>
                 <h2>Invoice #{invoice.invoiceNumber}</h2>
                 <Button onClick={handleDownload} variant="outline" size="small">Download PDF</Button>
            </div>
            {actionError && <Alert type="error" message={actionError} onClose={() => setActionError('')} />}


            <div className={styles.invoiceHeader}>
                <div className={styles.customerInfo}>
                    <h3>Customer Details</h3>
                    <p><strong>Name:</strong> {invoice.customerName}</p>
                    {invoice.customerPhone && <p><strong>Phone:</strong> {invoice.customerPhone}</p>}
                </div>
                <div className={styles.invoiceMeta}>
                     <h3>Invoice Info</h3>
                     <p><strong>Status:</strong> <span className={styles[`status${invoice.status}`]}>{invoice.status}</span></p> {/* Display Status */}
                     <p><strong>Payment:</strong> {invoice.paymentStatus}</p>
                     <p><strong>Date Created:</strong> {formatDate(invoice.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p> {/* More detailed format */}
                     <p><strong>Created By:</strong> {invoice.createdBy?.name || 'N/A'}</p>
                     <p><strong>Internal ID:</strong> {invoice._id}</p> {/* Show internal ID if needed */}
                </div>
            </div>

            <div className={styles.itemsSection}>
                <h3>Items</h3>
                <table className={styles.itemsTable}>
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th className={styles.numberCell}>Qty</th>
                            <th className={styles.numberCell}>Unit Price</th>
                            <th className={styles.numberCell}>Discount</th>
                            <th className={styles.numberCell}>Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.length > 0 ? (
                            invoice.items.map((item, index) => {
                                // Calculate line total using stored historical data
                                const lineTotal = (item.quantity * item.priceAtSale) * (1 - (item.discountPercentageAtSale || 0) / 100);
                                return (
                                    // Use index as key only if product ID is somehow missing (shouldn't happen)
                                    <tr key={item.product?._id || index}>
                                        {/* Use denormalized data stored on the item */}
                                        <td>{item.productSku || 'N/A'}</td>
                                        <td>{item.productName || 'Product details missing'}</td>
                                        <td className={styles.numberCell}>{item.quantity}</td>
                                        <td className={styles.numberCell}>{formatCurrency(item.priceAtSale)}</td>
                                        <td className={styles.numberCell}>{item.discountPercentageAtSale?.toFixed(1) || '0.0'}%</td>
                                        <td className={styles.numberCell}>{formatCurrency(lineTotal)}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className={styles.noItems}>No items found for this invoice.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Totals Section --- */}
            <div className={styles.totalSection}>
                <p>Subtotal: <span className={styles.amount}>{formatCurrency(invoice.subtotal)}</span></p>
                <p>CGST ({invoice.cgstRate?.toFixed(1)}%): <span className={styles.amount}>{formatCurrency(invoice.cgstAmount)}</span></p>
                <p>SGST ({invoice.sgstRate?.toFixed(1)}%): <span className={styles.amount}>{formatCurrency(invoice.sgstAmount)}</span></p>
                <p className={styles.grandTotal}>Grand Total: <span className={styles.amount}>{formatCurrency(invoice.grandTotal)}</span></p>
            </div>

            {/* Back button */}
             <Button className={styles.backButton} onClick={() => navigate('/view-invoices')} variant="secondary">
                Back to Invoices List
             </Button>

        </div>
    );
};

export default ViewInvoiceDetailsPage;