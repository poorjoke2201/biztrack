const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/invoices
// @desc    Get all invoices
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({})
      .populate('items.product', 'name selling_price')
      .populate('createdBy', 'name');
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/invoices
// @desc    Create a new invoice
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { customerName, customerPhone, items, totalAmount } = req.body;
    
    // Create invoice
    const invoice = new Invoice({
      customerName,
      customerPhone,
      items,
      totalAmount,
      createdBy: req.user._id
    });
    
    // Update product stock levels
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }
    
    const createdInvoice = await invoice.save();
    
    res.status(201).json(createdInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/invoices/:id
// @desc    Get an invoice by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('items.product', 'name selling_price')
      .populate('createdBy', 'name');
    
    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;