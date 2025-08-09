const express = require("express");
const Customer = require("../models/customer");
const router = express.Router();

//get

router.get("/get", async (req, res) => {
  try {
    // const { username } = req.query;

    // const filter = username
    //   ? { username: { $regex: username, $options: "i" } }
    //   : {};

    const users = await Customer.find();

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      message: "Customer listed successfully",
      data: users,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

//post

router.post("/create", async (req, res) => {
  try {
    const { username, unit, amount, received, balance, status, date } =
      req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!unit) {
      return res.status(400).json({ message: "Unit is required" });
    }

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const newCustomer = new Customer({
      username,
      unit,
      amount,
      received,
      balance,
      status: status || undefined,
      date: date || undefined,
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
    const { username, unit, amount, received, balance, status, date } =
      req.body;
    const { id } = req.params;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    if (!unit) {
      return res.status(400).json({ message: "Unit is required" });
    }
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const user = await Customer.findByIdAndUpdate(
      id,
      {
        username,
        unit,
        amount,
        received,
        balance,
        status: status || undefined,
        date: date || undefined,
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
    const user = await Customer.findById(id);

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
    const deletedUser = await Customer.findByIdAndDelete(id);
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
