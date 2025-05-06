// src/pages/GenerateInvoicePage/GenerateInvoiceForm.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';
import styles from './GenerateInvoicePage.module.css';
import ProductSelector from './ProductSelector'; // Assuming this component exists and works
// Import corrected service function name
import { createInvoice } from '../../services/invoiceService'; // <-- USE createInvoice
// Import product service to fetch products for selector
import { getAllProducts } from '../../services/productService'; // <-- NEED THIS
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button'; // Import Button
import InputField from '../../components/InputField/InputField'; // Import InputField

const GenerateInvoiceForm = () => {
  // State for ALL available products (for the selector dropdown)
  const [allProducts, setAllProducts] = useState([]);
  // State for items added to the current invoice cart
  // Store more product details in cart for display and calculation
  const [cartItems, setCartItems] = useState([]); // [{ product: { _id, name, sellingPrice, currentStock, sku, discountPercentage }, quantity: number }]

  // Form input states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // States for calculated totals (display only)
  const [subtotal, setSubtotal] = useState(0);
  const [taxes, setTaxes] = useState({ cgst: 0, sgst: 0 });
  const [grandTotal, setGrandTotal] = useState(0);

  // UI states
  const [error, setError] = useState('');
  const [productLoadError, setProductLoadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [loadingProducts, setLoadingProducts] = useState(true);

  const navigate = useNavigate();
  const TAX_RATE = { cgst: 2.5, sgst: 2.5 }; // Define tax rates

  // --- Fetch all products for the selector on mount ---
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductLoadError('');
      try {
        console.log("Fetching products for invoice generation...");
        const data = await getAllProducts(); // <-- Use actual service call
        if (isMounted) {
          if (Array.isArray(data)) {
            setAllProducts(data);
          } else {
            console.error("Received non-array product data:", data);
            setProductLoadError('Failed to load product list: Invalid format.');
          }
        }
      } catch (err) {
        console.error('Error fetching products for invoice:', err);
        if (isMounted) setProductLoadError('Failed to load product list.');
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; }
  }, []);

  // --- Recalculate totals whenever cartItems change ---
  // Use useCallback to memoize the calculation function
  const calculateTotals = useCallback(() => {
    let currentSubtotal = 0;
    cartItems.forEach(item => {
      // Use price and discount stored in the cart item's product object
      const price = item.product.sellingPrice || 0;
      const discount = item.product.discountPercentage || 0;
      const lineTotal = price * item.quantity * (1 - discount / 100);
      currentSubtotal += lineTotal;
    });

    const cgst = currentSubtotal * (TAX_RATE.cgst / 100);
    const sgst = currentSubtotal * (TAX_RATE.sgst / 100);
    const currentGrandTotal = currentSubtotal + cgst + sgst;

    setSubtotal(currentSubtotal);
    setTaxes({ cgst, sgst });
    setGrandTotal(currentGrandTotal);
  }, [cartItems, TAX_RATE.cgst, TAX_RATE.sgst]); // Dependencies

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]); // Run effect when calculateTotals changes

   // Helper to format currency
   const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  // --- Handlers ---

  const handleProductSelect = (productId) => {
    setError('');
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    const alreadySelected = cartItems.some(item => item.product._id === productId);
    if (!alreadySelected) {
      if (product.currentStock < 1) {
        setError(`Product "${product.name}" is out of stock.`);
        return;
      }
      // Add the full product object needed for calculations/display
      setCartItems([...cartItems, {
          product: { // Store needed product details
              _id: product._id,
              name: product.name,
              sku: product.sku,
              sellingPrice: product.sellingPrice,
              currentStock: product.currentStock,
              discountPercentage: product.discountPercentage
          },
          quantity: 1
       }]);
    } else {
      setError(`Product "${product.name}" is already added. Adjust quantity below.`);
    }
  };

  const handleQuantityChange = (productId, quantityStr) => {
    setError('');
    const quantity = parseInt(quantityStr, 10);
    const currentItem = cartItems.find(item => item.product._id === productId);
    if (!currentItem) return;

    const stockLimit = currentItem.product.currentStock;

    if (isNaN(quantity) || quantity < 1) {
        // If quantity is invalid or less than 1, remove the item
        handleRemoveProduct(productId);
        // Optionally set error: setError(`Quantity must be at least 1.`);
        return;
    }

    if (quantity > stockLimit) {
        setError(`Quantity for "${currentItem.product.name}" cannot exceed stock (${stockLimit}). Setting to max.`);
        setCartItems(prev =>
            prev.map(item => (item.product._id === productId ? { ...item, quantity: stockLimit } : item))
        );
    } else {
      // Valid quantity
      setCartItems(prev =>
        prev.map(item => (item.product._id === productId ? { ...item, quantity: quantity } : item))
      );
    }
  };

  const handleRemoveProduct = (productId) => {
    setError('');
    setCartItems(prev => prev.filter(item => item.product._id !== productId));
  };

  // --- Handle Invoice Submission ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (cartItems.length === 0) {
      setError('Please add at least one product to the invoice.');
      return;
    }
    if (!customerName.trim()) {
      setError('Please enter the customer name.');
      return;
    }

    setLoading(true);

    // Construct ONLY the data needed by the backend
    const invoiceData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      items: cartItems.map(item => ({
        product: item.product._id, // Send only the product ID
        quantity: item.quantity,
        // Backend will look up price/discount at time of creation
      })),
      // DO NOT send totals - backend calculates these
    };

    console.log("Submitting Invoice Data:", invoiceData);

    try {
      // --- Use the CORRECT service function ---
      const response = await createInvoice(invoiceData); // <-- CORRECTED FUNCTION CALL
      // ---

      setLoading(false);

      if (response && response._id && response.invoiceNumber) { // Check for expected response fields
        setSuccessMessage(`Invoice ${response.invoiceNumber} generated successfully!`);
        setCartItems([]); // Clear cart
        setCustomerName('');
        setCustomerPhone('');
        setSubtotal(0); setTaxes({cgst:0, sgst:0}); setGrandTotal(0); // Reset calculated totals
        // navigate(`/invoices/${response._id}`); // Option: Navigate to details page
         // Refresh product list in background maybe? Or assume stock updated ok.
      } else {
        // Handle potential backend error response structure
        setError(response?.message || 'Failed to generate invoice. Unexpected server response.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Error generating invoice:', err);
      // Handle network errors or specific errors from backend (like stock check failure)
      setError(err.response?.data?.message || err.message || 'An unexpected server error occurred.');
    }
  };

  // --- Render ---
  return (
    // Use a specific class if needed, or reuse styles
    <form onSubmit={handleSubmit} className={styles.generateInvoiceForm}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {productLoadError && <Alert type="error" message={productLoadError} />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')}/>}

      {/* Customer Details */}
      <fieldset className={styles.fieldset}>
          <legend>Customer Information</legend>
          <div className={styles.customerDetails}>
            {/* Use InputField Component */}
            <InputField label="Customer Name *" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required disabled={loading}/>
            <InputField label="Customer Phone" id="customerPhone" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} disabled={loading} />
          </div>
      </fieldset>

      {/* Product Selection */}
      <fieldset className={styles.fieldset}>
          <legend>Add Products</legend>
          {loadingProducts ? (
               <Spinner message="Loading products..." />
          ) : productLoadError ? (
                <Alert type="warning" message={productLoadError}/> // Show warning if products fail but allow proceeding maybe?
          ) : (
               <ProductSelector
                 products={allProducts}
                 onSelect={handleProductSelect}
                 selectedProducts={cartItems.map(item => item.product._id)} // Pass IDs of items in cart
               />
          )}
      </fieldset>

      {/* Selected Products List/Cart */}
      {cartItems.length > 0 && (
        <fieldset className={`${styles.fieldset} ${styles.selectedProducts}`}>
          <legend>Invoice Items</legend>
          {/* Consider using a Table component here if you have one */}
          <ul className={styles.itemList}>
            {cartItems.map(({ product, quantity }) => ( // Destructure here
              <li key={product._id} className={styles.itemEntry}>
                <div className={styles.itemName}>
                    {product.name} <span className={styles.itemSku}>(SKU: {product.sku})</span>
                    <div className={styles.itemPriceInfo}>
                        @ {formatCurrency(product.sellingPrice)}
                        {product.discountPercentage > 0 && <span className={styles.itemDiscount}> ({product.discountPercentage}% off)</span>}
                    </div>
                </div>
                 <div className={styles.itemControls}>
                   <label htmlFor={`quantity-${product._id}`} className={styles.quantityLabel}>Qty:</label>
                   <input
                     id={`quantity-${product._id}`}
                     type="number"
                     min="1"
                     max={product.currentStock}
                     value={quantity}
                     onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                     className={styles.quantityInput}
                     aria-label={`Quantity for ${product.name}`}
                     disabled={loading}
                   />
                   <Button
                     type="button"
                     onClick={() => handleRemoveProduct(product._id)}
                     variant="danger" // Use Button component
                     size="small"
                     title={`Remove ${product.name}`}
                     disabled={loading}
                    >
                     Remove
                    </Button>
                 </div>
              </li>
            ))}
          </ul>
          {/* Display Calculated Totals */}
          <div className={styles.totalsSection}>
             <p>Subtotal: <span className={styles.amount}>{formatCurrency(subtotal)}</span></p>
             <p>CGST ({TAX_RATE.cgst}%): <span className={styles.amount}>{formatCurrency(taxes.cgst)}</span></p>
             <p>SGST ({TAX_RATE.sgst}%): <span className={styles.amount}>{formatCurrency(taxes.sgst)}</span></p>
             <p className={styles.grandTotal}>Grand Total: <span className={styles.amount}>{formatCurrency(grandTotal)}</span></p>
          </div>
        </fieldset>
      )}

      {/* Submit Button */}
      <div className={styles.submitButtonContainer}>
          <Button
             type="submit"
             disabled={loading || loadingProducts || cartItems.length === 0}
             variant="primary" // Use Button component
             size="large"
            >
            {loading ? <Spinner size="small" /> : 'Generate Invoice'}
          </Button>
      </div>
    </form>
  );
};

export default GenerateInvoiceForm;