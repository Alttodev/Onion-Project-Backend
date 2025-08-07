const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  username: String,
  unit: Number,
  amount: Number,
  received: Number,
  balance: Number,
  status: {
    type: String,
    enum: ["pending", "completed"],
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Customer", CustomerSchema);
