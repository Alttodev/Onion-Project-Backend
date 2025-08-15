const express = require("express");
const customer = require("../models/customer");
const customerList = require("../models/customerList");
const router = express.Router();

//get

router.get("/get", async (req, res) => {
  try {
    const { search, date, page = 1, limit = 5 } = req.query;

    let filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ username: regex }, { address: regex }, { phone: regex }];
    }

    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      customer
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      customer.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Customer listed successfully",
      data: users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching data" });
  }
});

//post

router.post("/create", async (req, res) => {
  try {
    const { username, address, phone, date } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const newCustomer = new customer({
      username,
      address,
      phone,
      date,
    });
    await newCustomer.save();

    res.status(201).json({
      message: "Customer created successfully",
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
      return res.status(409).json({ message: "Username already exists." });
    }
    res.status(500).json({ message: "Server error" });
  }
});

//update

router.put("/update/:id", async (req, res) => {
  try {
    const { username, address, phone, date } = req.body;
    const { id } = req.params;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const user = await customer.findByIdAndUpdate(
      id,
      {
        username,
        address,
        phone,
        date,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating user" });
  }
});

//info
router.get("/info/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Customer not found" });
    }
    const user = await customer.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer  viewed successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

//delete

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await customer.findByIdAndDelete(id);
    await customerList.deleteMany({ customerId: id });

    if (!deletedUser) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting Customer" });
  }
});

module.exports = router;
