const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Needed for ObjectId validation
const Product = require('../models/Product.js'); // Adjust path if needed
const { protect, admin } = require('../middleware/authMiddleware.js'); // Adjust path if needed

// Debugging: Log when routes are registered
console.log('🚦 Product Routes Registration Started...');

// Middleware for logging requests to this specific router
router.use((req, res, next) => {
  console.log(`✅ Request Hit productRoutes.js: ${req.method} ${req.url}`);
  next();
});

// --- GET ALL PRODUCTS ---
// @route   GET /api/products
// @desc    Get all products
// @access  Private (Requires login)
router.get('/', protect, async (req, res) => {
  console.log('Request received for GET /api/products');
  try {
    const products = await Product.find({}); // Fetch all products
    console.log(`Found ${products.length} products.`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
});

// --- CREATE A NEW PRODUCT ---
// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin (Requires admin login)
router.post('/', protect, admin, async (req, res) => {
  console.log('Request received for POST /api/products');
  console.log('Request Body:', req.body);
  try {
    // Destructure all expected fields from req.body
    const { name, category, mfd, expiryDate, cost_price, selling_price, discount, mrp, stock, lowStockThreshold } = req.body;

    // --- Basic Backend Validation ---
    if (!name || selling_price === undefined || selling_price === null || stock === undefined || stock === null) {
        console.log('Validation Error: Missing required fields (name, selling_price, stock)');
        return res.status(400).json({ message: 'Name, Selling Price, and Stock are required fields.' });
    }

    // --- Check for Duplicates (using 'name' as the unique key) ---
    // Consider if a case-insensitive check is better: new RegExp('^' + name + '$', 'i')
    const existingProduct = await Product.findOne({ name: name });

    if (existingProduct) {
        console.log(`Attempt to create duplicate product failed. Name: "${name}" already exists.`);
        return res.status(400).json({ message: `Product with name "${name}" already exists.` });
    }
    // --- End Duplicate Check ---

    // If no duplicate, proceed to create
    console.log(`Creating new product with name: "${name}"`);
    const product = new Product({
      name,
      category,
      mfd,
      expiryDate,
      cost_price,
      selling_price,
      discount, // Mongoose schema default will apply if not provided
      mrp,
      stock,
      lowStockThreshold // Mongoose schema default will apply if not provided
    });

    const createdProduct = await product.save(); // Mongoose validation (incl. required fields) happens here
    console.log(`Product created successfully: ${createdProduct.name} (${createdProduct._id})`);
    res.status(201).json(createdProduct); // Send back the created product

  } catch (error) {
    console.error('Error creating product:', error);
    // Handle Mongoose validation errors specifically
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        console.log('Mongoose Validation Error:', messages.join('. '));
        return res.status(400).json({ message: messages.join('. ') });
    }
    // Handle other potential errors (e.g., database connection issue)
    res.status(500).json({ message: 'Server error while creating product.' });
  }
});

// --- GET UNIQUE CATEGORIES ---
// @route   GET /api/products/utils/categories
// @desc    Get a list of unique product category names
// @access  Private (Requires login)
router.get('/utils/categories', protect, async (req, res) => {
    console.log('Request received for GET /api/products/utils/categories');
    try {
        // Use distinct() to get unique non-null/non-empty category values
        const categories = await Product.distinct('category', { category: { $ne: null, $ne: "" } });
        console.log(`Found ${categories.length} unique categories.`);
        res.json(categories.sort()); // Send sorted list
    } catch (error) {
        console.error('Error fetching distinct categories:', error);
        res.status(500).json({ message: 'Server error fetching categories.' });
    }
});


// --- GET LOW STOCK PRODUCTS ---
// @route   GET /api/products/lowstock
// @desc    Get products where stock is less than or equal to lowStockThreshold
// @access  Private (Requires login)
router.get('/lowstock', protect, async (req, res) => {
  console.log('Request received for GET /api/products/lowstock');
  try {
    // Find products where stock <= lowStockThreshold
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] }
    });
    console.log(`Found ${products.length} low stock products.`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ message: 'Server error fetching low stock products.' });
  }
});


// --- GET SINGLE PRODUCT BY ID ---
// @route   GET /api/products/:id
// @desc    Get a product by ID
// @access  Private (Requires login)
router.get('/:id', protect, async (req, res) => {
  const productId = req.params.id;
  console.log(`Request received for GET /api/products/${productId}`);
  try {
     // Validate ID format
     if (!mongoose.Types.ObjectId.isValid(productId)) {
          console.log(`Invalid ID format: ${productId}`);
          return res.status(400).json({ message: 'Invalid product ID format' });
     }

    const product = await Product.findById(productId);

    if (product) {
      console.log(`Product found: ${product.name} (${productId})`);
      res.json(product);
    } else {
      console.log(`Product not found with ID: ${productId}`);
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    res.status(500).json({ message: 'Server error fetching product.' });
  }
});

// --- UPDATE PRODUCT BY ID ---
// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin (Requires admin login)
router.put('/:id', protect, admin, async (req, res) => {
  const productId = req.params.id;
  console.log(`Request received for PUT /api/products/${productId}`);
  console.log('Request Body for Update:', req.body);
  try {
     // Validate ID format
     if (!mongoose.Types.ObjectId.isValid(productId)) {
          console.log(`Invalid ID format: ${productId}`);
          return res.status(400).json({ message: 'Invalid product ID format' });
     }

    const product = await Product.findById(productId);

    if (product) {
      console.log(`Found product to update: ${product.name}`);
      // Update fields selectively from req.body
      product.name = req.body.name || product.name;
      product.category = req.body.category || product.category;
      product.mfd = req.body.mfd || product.mfd;
      product.expiryDate = req.body.expiryDate || product.expiryDate;
      product.cost_price = req.body.cost_price !== undefined ? req.body.cost_price : product.cost_price; // Allow setting 0
      product.selling_price = req.body.selling_price !== undefined ? req.body.selling_price : product.selling_price; // Allow setting 0
      product.discount = req.body.discount !== undefined ? req.body.discount : product.discount; // Allow setting 0
      product.mrp = req.body.mrp !== undefined ? req.body.mrp : product.mrp; // Allow setting 0
      product.stock = req.body.stock !== undefined ? req.body.stock : product.stock; // Allow setting 0
      product.lowStockThreshold = req.body.lowStockThreshold !== undefined ? req.body.lowStockThreshold : product.lowStockThreshold; // Allow setting 0

      // Optional: If name is changing, check for duplicates again
      if (req.body.name && req.body.name !== product.name) {
          const existingProduct = await Product.findOne({ name: req.body.name });
          if (existingProduct && existingProduct._id.toString() !== productId) {
              console.log(`Update failed: Name "${req.body.name}" already exists on another product.`);
              return res.status(400).json({ message: `Product name "${req.body.name}" already exists.` });
          }
      }

      const updatedProduct = await product.save(); // Run validators on save
      console.log(`Product updated successfully: ${updatedProduct.name}`);
      res.json(updatedProduct); // Send back updated product

    } else {
      console.log(`Product not found with ID: ${productId} for update.`);
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
     // Handle Mongoose validation errors specifically
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
         console.log('Mongoose Validation Error on Update:', messages.join('. '));
        return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error while updating product.' });
  }
});

// --- DELETE PRODUCT BY ID ---
// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin (Requires admin login)
router.delete('/:id', protect, admin, async (req, res) => {
  const productId = req.params.id;
  console.log(`Request received for DELETE /api/products/${productId}`);
  try {
      // Validate ID format
     if (!mongoose.Types.ObjectId.isValid(productId)) {
          console.log(`Invalid ID format: ${productId}`);
          return res.status(400).json({ message: 'Invalid product ID format' });
     }

    const product = await Product.findById(productId);

    if (product) {
      await Product.deleteOne({ _id: productId }); // Use deleteOne or findByIdAndDelete
      console.log(`Product deleted successfully: ${product.name} (${productId})`);
      res.json({ message: 'Product removed' }); // Standard success message
    } else {
      console.log(`Product not found with ID: ${productId} for deletion.`);
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    res.status(500).json({ message: 'Server error while deleting product.' });
  }
});

console.log('✅ Product Routes Configured.');

module.exports = router;