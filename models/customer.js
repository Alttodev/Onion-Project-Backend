const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  unit: String,
  amount: String,
  received:String,
  balance: String,
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
