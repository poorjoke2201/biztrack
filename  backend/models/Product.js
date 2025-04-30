const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  mfd: { type: Date },
  expiryDate: { type: Date },
  cost_price: { type: Number },
  selling_price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  mrp: { type: Number },
  stock: { type: Number, required: true },
  lowStockThreshold: { type: Number, default: 10 }
}, { timestamps: true });


module.exports = mongoose.model('Product', ProductSchema);
