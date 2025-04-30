const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true } // capture price at time of billing
    }
  ],

  totalAmount: { type: Number, required: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
