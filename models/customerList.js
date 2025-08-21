const mongoose = require("mongoose");

const CustomerListSchema = new mongoose.Schema(
  {
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
      // type: mongoose.Schema.Types.ObjectId,
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("customerList", CustomerListSchema);
