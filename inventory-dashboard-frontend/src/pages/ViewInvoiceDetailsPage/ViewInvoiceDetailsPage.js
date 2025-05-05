import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Added Link
import MainLayout from '../../layouts/MainLayout/MainLayout';
import styles from './ViewInvoiceDetailsPage.module.css'; // Import styles
import { getInvoiceById } from '../../services/invoiceService'; // Import the service function
import Spinner from '../../components/Spinner/Spinner'; // Assuming components exist
import Alert from '../../components/Alert/Alert';    // Assuming components exist

const ViewInvoiceDetailsPage = () => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { invoiceId } = useParams(); // Get ID from router parameter
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true; // Prevent state update on unmounted component
        const fetchInvoice = async () => {
            console.log(`Attempting to fetch invoice with ID: ${invoiceId}`);
            setLoading(true);
            setError(null);
            setInvoice(null); // Reset previous data
            try {
                const data = await getInvoiceById(invoiceId);
                console.log("Invoice details received:", data);
                if (isMounted) {
                    setInvoice(data); // Set the fetched invoice data
                }
            } catch (err) {
                 if (isMounted) {
                    console.error("Error fetching invoice details:", err);
                    // Use detailed error message if available
                    setError(err.response?.data?.message || err.message || "Failed to load invoice details.");
                 }
            } finally {
               if (isMounted) setLoading(false); // Stop loading regardless of success/failure
            }
        };

        // Basic check if invoiceId looks like a valid ID before fetching
        if (invoiceId && invoiceId.length > 10) { // Simple length check, adjust if needed
            fetchInvoice();
        } else {
            console.error("Invalid Invoice ID provided in URL:", invoiceId);
            setError("Invalid or missing Invoice ID in URL.");
            setLoading(false);
        }

        // Cleanup function to set isMounted to false when the component unmounts
        return () => { isMounted = false; };
    }, [invoiceId]); // Re-run effect if invoiceId changes

    // --- Render Logic ---

    // Loading State
    if (loading) {
        return (
            <MainLayout>
                {/* Apply styles */}
                <div className={styles.detailsPage}>
                    <h2>Invoice Details</h2>
                    <Spinner />
                    <p className={styles.loadingText}>Loading invoice details...</p>
                </div>
            </MainLayout>
        );
    }

    // Error State
    if (error) {
        return (
            <MainLayout>
                {/* Apply styles */}
                <div className={styles.detailsPage}>
                    <h2>Invoice Details</h2>
                    <Alert type="error" message={error} />
                    {/* Use className for button */}
                    <button className={styles.backButton} onClick={() => navigate('/view-invoices')}>Back to Invoices</button>
                </div>
            </MainLayout>
        );
    }

    // Handle case where loading is finished, no error, but invoice is still null
    if (!invoice) {
         return (
            <MainLayout>
                <div className={styles.detailsPage}>
                     <h2>Invoice Details</h2>
                     <Alert type="warning" message="Invoice data not found or could not be loaded." />
                     <button className={styles.backButton} onClick={() => navigate('/view-invoices')}>Back to Invoices</button>
                </div>
            </MainLayout>
         );
    }

    // --- Success State: Display Invoice Details ---
    return (
        <MainLayout>
            {/* Apply styles */}
            <div className={styles.detailsPage}>
                {/* Use a dynamic title */}
                <h2>Invoice #{invoice._id?.substring(invoice._id.length - 6)}</h2> {/* Example: Show last 6 chars of ID */}

                <div className={styles.invoiceHeader}>
                    <div className={styles.customerInfo}>
                        <h3>Customer Details</h3>
                        <p><strong>Name:</strong> {invoice.customerName}</p>
                        {/* Conditionally render phone if available */}
                        {invoice.customerPhone && <p><strong>Phone:</strong> {invoice.customerPhone}</p>}
                    </div>
                    <div className={styles.invoiceMeta}>
                         <h3>Invoice Info</h3>
                         <p><strong>Invoice ID:</strong> {invoice._id}</p>
                         {/* Format date using toLocaleString for readability */}
                         <p><strong>Date Created:</strong> {new Date(invoice.createdAt).toLocaleString()}</p>
                         {/* Access populated createdBy user's name */}
                         <p><strong>Created By:</strong> {invoice.createdBy?.name || 'N/A'}</p>
                    </div>
                </div>

                <div className={styles.itemsSection}>
                    <h3>Items</h3>
                    <table className={styles.itemsTable}>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                {/* Add Price and Subtotal columns */}
                                <th className={styles.numberCell}>Price per Item</th>
                                <th className={styles.numberCell}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Check if items array exists and has items */}
                            {invoice.items?.length > 0 ? (
                                invoice.items.map((item, index) => (
                                    <tr key={item.product?._id || index}> {/* Use product ID if available, else index */}
                                        {/* Access populated product name or show ID if not populated/found */}
                                        <td>{item.product?.name || `Product ID: ${item.product}` || 'Product Error'}</td>
                                        <td>{item.quantity}</td>
                                        {/* Price is stored directly on the item in the Invoice model */}
                                        <td className={styles.numberCell}>₹{item.price?.toFixed(2) || 'N/A'}</td>
                                        {/* Calculate subtotal */}
                                        <td className={styles.numberCell}>₹{(item.quantity * item.price)?.toFixed(2) || 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>No items found for this invoice.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.totalSection}>
                    <p className={styles.totalAmount}>
                        {/* Format total amount */}
                        Total Amount: ₹{invoice.totalAmount?.toFixed(2) || 'N/A'}
                    </p>
                </div>

                {/* Back button using className */}
                 <button className={styles.backButton} onClick={() => navigate('/view-invoices')}>Back to Invoices</button>

            </div>
        </MainLayout>
    );
};

export default ViewInvoiceDetailsPage;