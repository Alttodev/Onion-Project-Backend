const mongoose = require("mongoose");

const CustomerOrderSchema = new mongoose.Schema(
  {
    userName: String,
    unit: String,
    amount: String,
    received: String,
    balance: String,
    status: {
      type: String,
      enum: ["pending", "completed"],
    },
    createdDate: {
      type: Date,
    },
    updatedDate: {
      type: Date,
    },
    customerId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("customerOrder", CustomerOrderSchema);
