const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  phone: String,
  address: String,
  date: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("customer", CustomerSchema);
