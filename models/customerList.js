const mongoose = require("mongoose");

const CustomerListSchema = new mongoose.Schema({
  unit: String,
  amount: String,
  received: String,
  balance: String,
  status: {
    type: String,
    enum: ["pending", "completed"],
  },
  date: {
    type: Date,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
    required: true,
  },
});

module.exports = mongoose.model("customerList", CustomerListSchema);
