const express = require('express');
const router = express.Router();
const Product = require('../models/Product.js');
const { protect, admin } = require('../middleware/authMiddleware.js');



// Debugging: Check if middleware and model are imported correctly
console.log('Middleware:', protect, admin);
console.log('Product Model:', Product);

// @route   GET /api/products
// @desc    Get all products
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, category, mfd, expiryDate, cost_price, selling_price, discount, mrp, stock, lowStockThreshold } = req.body;

    const product = new Product({
      name,
      category,
      mfd,
      expiryDate,
      cost_price,
      selling_price,
      discount,
      mrp,
      stock,
      lowStockThreshold
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get a product by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, category, mfd, expiryDate, cost_price, selling_price, discount, mrp, stock, lowStockThreshold } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.category = category || product.category;
      product.mfd = mfd || product.mfd;
      product.expiryDate = expiryDate || product.expiryDate;
      product.cost_price = cost_price || product.cost_price;
      product.selling_price = selling_price || product.selling_price;
      product.discount = discount !== undefined ? discount : product.discount;
      product.mrp = mrp || product.mrp;
      product.stock = stock !== undefined ? stock : product.stock;
      product.lowStockThreshold = lowStockThreshold || product.lowStockThreshold;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.remove();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/lowstock
// @desc    Get low stock products
// @access  Private
router.get('/lowstock', protect, async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
