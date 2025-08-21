const express = require("express");
const Customer = require("../models/customer");
const router = express.Router();

router.get("/get", async (req, res) => {
  try {
    const { name } = req.query;

    if (name !== "customer") {
      return res.status(400).json({
        message: "Invalid name parameter",
        data: [],
      });
    }

    const customers = await Customer.find().select("_id username");

    res.status(200).json({
      message: "CustomerName listed successfully",
      data: customers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching data" });
  }
});

module.exports = router;
