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
  },
  date: {
    type: Date,
  },
});

module.exports = mongoose.model("Customer", CustomerSchema);
