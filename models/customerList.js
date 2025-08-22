const mongoose = require("mongoose");

const CustomerListSchema = new mongoose.Schema(
  {
    username:String,
    unit: String,
    amount: String,
    received: String,
    balance: String,
    status: {
      type: String,
      enum: ["pending", "completed","ordered"],
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
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "customerOrder" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("customerList", CustomerListSchema);
