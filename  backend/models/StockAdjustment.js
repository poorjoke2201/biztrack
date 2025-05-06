// models/StockAdjustment.js
const mongoose = require('mongoose');

const StockAdjustmentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: { // User who performed the adjustment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantityChange: { // Positive for adding, negative for removing
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'Initial Stock',
      'Received Shipment',
      'Customer Return',
      'Damaged Goods',
      'Expired Goods',
      'Stock Correction (Found)',
      'Stock Correction (Shortage)',
      'Internal Use',
      'Manual Removal'
      // Add other reasons as needed
    ]
  },
  adjustmentDate: { // Defaults to now, but allows backdating if needed
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Middleware to automatically update the Product's currentStock after saving an adjustment
StockAdjustmentSchema.post('save', async function(doc, next) {
  console.log(`StockAdjustment Hook: Adjusting stock for Product ${doc.product} by ${doc.quantityChange}`);
  try {
    // Use the constructor's model reference to avoid circular dependencies
    await this.constructor.model('Product').findByIdAndUpdate(doc.product, {
      $inc: { currentStock: doc.quantityChange } // Use $inc to atomically add/subtract
    });
    console.log(`StockAdjustment Hook: Product ${doc.product} stock updated.`);
    next();
  } catch (error) {
    console.error(`StockAdjustment Hook Error: Failed to update stock for Product ${doc.product}`, error);
    // Decide how to handle this - maybe log it prominently?
    // Depending on your error strategy, you might pass the error to next(error)
    // For now, we log it but allow the process to continue.
    next();
  }
});


module.exports = mongoose.model('StockAdjustment', StockAdjustmentSchema);