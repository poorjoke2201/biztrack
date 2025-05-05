import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GenerateInvoicePage.module.css';
import ProductSelector from './ProductSelector';
import { getAllProducts } from '../../services/inventoryService';
import { generateNewInvoice } from '../../services/invoiceService';
import Alert from '../../components/Alert/Alert'; // Assuming components exist
import Spinner from '../../components/Spinner/Spinner'; // Assuming components exist

const GenerateInvoiceForm = () => {
  // State for all available products fetched from backend
  const [allProducts, setAllProducts] = useState([]);
  // State for items added to the current invoice { productId: _id, quantity: number }
  const [selectedItems, setSelectedItems] = useState([]);
  // Form input states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState(''); // Added phone state
  // Invoice date defaults to today, consider if user should change it
  //const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  // Calculated total amount
  const [totalAmount, setTotalAmount] = useState(0);
  // UI states
  const [error, setError] = useState('');
  const [productLoadError, setProductLoadError] = useState(''); // Specific error for product loading
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [loadingProducts, setLoadingProducts] = useState(true); // Separate loading for products

  const navigate = useNavigate();

  // Fetch all products for the selector on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductLoadError('');
      try {
        const data = await getAllProducts();
        if (isMounted) {
            if(Array.isArray(data)) {
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
    return () => { isMounted = false; } // Cleanup
  }, []);

  // Recalculate total amount whenever selected items or their quantities change
  useEffect(() => {
    let newTotal = 0;
    selectedItems.forEach(item => {
      // Find the full product details from the fetched list
      const product = allProducts.find(p => p._id === item.productId); // Use _id
      if (product && product.selling_price != null && item.quantity > 0) { // Use selling_price
        newTotal += product.selling_price * item.quantity;
      }
    });
    setTotalAmount(newTotal);
  }, [selectedItems, allProducts]); // Depend on items and the product list

  // --- Handlers ---

  const handleProductSelect = (productId) => { // Receives product _id
    setError(''); // Clear general errors when adding products
    const product = allProducts.find(p => p._id === productId);
    if (!product) return; // Should not happen if selector is correct

    // Check if product is already selected
    const alreadySelected = selectedItems.some(item => item.productId === productId);
    if (!alreadySelected) {
       // Check stock before adding
       if (product.stock < 1) {
          setError(`Product "${product.name}" is out of stock.`);
          return;
       }
      // Add with initial quantity 1
      setSelectedItems([...selectedItems, { productId: productId, quantity: 1 }]);
    } else {
        setError(`Product "${product.name}" is already in the invoice. You can adjust the quantity.`);
    }
  };

  const handleQuantityChange = (productId, quantityStr) => {
    setError(''); // Clear general errors when changing quantity
    const quantity = parseInt(quantityStr, 10);

    // Find the product to check stock
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    // Validate quantity (must be at least 1 and not exceed stock)
    if (isNaN(quantity) || quantity < 1) {
      // If input becomes invalid or less than 1, reset to 1
      setSelectedItems(prev =>
        prev.map(item => (item.productId === productId ? { ...item, quantity: 1 } : item))
      );
      setError(`Quantity for "${product.name}" must be at least 1.`);
    } else if (quantity > product.stock) {
      // If quantity exceeds stock, set to max available stock
      setSelectedItems(prev =>
          prev.map(item => (item.productId === productId ? { ...item, quantity: product.stock } : item))
      );
      setError(`Quantity for "${product.name}" cannot exceed available stock (${product.stock}).`);
    } else {
      // Valid quantity, update state
      setSelectedItems(prev =>
        prev.map(item => (item.productId === productId ? { ...item, quantity: quantity } : item))
      );
    }
  };


  const handleRemoveProduct = (productId) => {
    setError(''); // Clear general errors when removing
    setSelectedItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (selectedItems.length === 0) {
      setError('Please select at least one product.');
      return;
    }
     if (!customerName.trim()) {
        setError('Please enter the customer name.');
        return;
     }

    setLoading(true);

    // --- Construct Invoice Items with Price ---
    const invoiceItems = selectedItems.map(item => {
      const product = allProducts.find(p => p._id === item.productId); // Use _id
      return {
        product: item.productId, // Pass the product _id
        quantity: item.quantity,
        price: product ? product.selling_price : 0, // Include selling_price, default to 0 if product somehow not found
      };
    }).filter(item => item.price !== 0); // Filter out items if product wasn't found (shouldn't happen)

    if (invoiceItems.length !== selectedItems.length) {
         setError("Error processing items. Could not find price for all selected products.");
         setLoading(false);
         return;
     }

    // --- Construct Final Invoice Data ---
    const invoiceData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined, // Send phone or undefined
      // invoiceDate is not in backend model/route, so don't send it unless added
      items: invoiceItems,
      totalAmount, // Send the calculated total
    };

    console.log("Submitting Invoice Data:", invoiceData);

    try {
      const response = await generateNewInvoice(invoiceData);
      setLoading(false);

      // --- Correct Success Check ---
      if (response && response._id) {
        setSuccessMessage('Invoice generated successfully!');
        setSelectedItems([]); // Clear selected items
        setCustomerName('');
        setCustomerPhone('');
        setTotalAmount(0);
        // Optionally fetch products again to update stock display if needed
        // navigate('/view-invoices'); // Redirect immediately
        setTimeout(() => navigate(`/view-invoices`), 1500); // Redirect after delay
      } else {
        setError(response?.message || 'Failed to generate invoice. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Error generating invoice:', err);
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    }
  };

  // --- Render ---
  return (
    <form onSubmit={handleSubmit} className={styles.generateInvoiceForm}>
      {error && <Alert type="error" message={error} />}
      {productLoadError && <Alert type="error" message={productLoadError} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Customer Details */}
      <div className={styles.customerDetails}>
          <div className={styles.formGroup}>
              <label htmlFor="customerName">Customer Name *</label>
              <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
              />
          </div>
          <div className={styles.formGroup}>
              <label htmlFor="customerPhone">Customer Phone</label>
              <input
                  type="tel" // Use type tel for phone numbers
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
              />
          </div>
          {/* Removed Invoice Date input unless added to backend */}
          {/* <div className={styles.formGroup}>
              <label htmlFor="invoiceDate">Invoice Date</label>
              <input type="date" id="invoiceDate" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required />
          </div> */}
      </div>


      {/* Product Selection */}
      <div className={styles.formGroup}>
        <label>Add Products to Invoice</label>
        {loadingProducts ? (
             <Spinner />
        ) : (
             <ProductSelector
               products={allProducts}
               onSelect={handleProductSelect}
               // Pass array of selected product _ids to disable them in dropdown
               selectedProducts={selectedItems.map(item => item.productId)}
             />
        )}

      </div>

      {/* Selected Products List */}
      {selectedItems.length > 0 && (
        <div className={styles.selectedProducts}>
          <h3>Invoice Items</h3>
          <ul className={styles.itemList}>
            {selectedItems.map(item => {
              // Find full product details using _id
              const product = allProducts.find(p => p._id === item.productId);
              // Render only if product details are found
              return product ? (
                <li key={item.productId} className={styles.itemEntry}>
                  <span className={styles.itemName}>{product.name}</span>
                  <span className={styles.itemPrice}> @ ₹{product.selling_price?.toFixed(2)}</span>
                  <div className={styles.itemControls}>
                     <label htmlFor={`quantity-${item.productId}`} className={styles.quantityLabel}>Qty:</label>
                     <input
                        id={`quantity-${item.productId}`}
                        type="number"
                        min="1"
                        max={product.stock} // Set max based on actual stock
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                        className={styles.quantityInput}
                        aria-label={`Quantity for ${product.name}`}
                     />
                     <button
                        type="button"
                        onClick={() => handleRemoveProduct(item.productId)}
                        className={styles.removeButton}
                        title={`Remove ${product.name}`}
                      >
                        Remove
                      </button>
                  </div>
                  <span className={styles.itemSubtotal}>
                      Subtotal: ₹{(product.selling_price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ) : null; // Don't render if product details not found
            })}
          </ul>
          <p className={styles.totalAmount}>Total Amount: ₹{totalAmount.toFixed(2)}</p>
        </div>
      )}

      {/* Submit Button */}
      <button type="submit" disabled={loading || loadingProducts || selectedItems.length === 0}>
        {loading ? <Spinner size="small" /> : 'Generate Invoice'}
      </button>
    </form>
  );
};

export default GenerateInvoiceForm;