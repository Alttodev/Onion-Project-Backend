const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'customerList' }, 
  items: [{ description: String, qty: Number, price: Number }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invoice', invoiceSchema);
