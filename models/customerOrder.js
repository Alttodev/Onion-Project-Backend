const mongoose = require("mongoose");

const CustomerOrderSchema = new mongoose.Schema(
  {
    username: String,
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
    listId: { type: mongoose.Schema.Types.ObjectId, ref: "customerList" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("customerOrder", CustomerOrderSchema);
