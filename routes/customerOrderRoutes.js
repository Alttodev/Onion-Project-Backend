const express = require("express");
const customerOrder = require("../models/customerOrder");
const customerList = require("../models/customerList");
const router = express.Router();

router.get("/get", async (req, res) => {
  try {
    const { search, from, to, page = 1, limit = 5 } = req.query;

    let filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        {
          username: regex,
        },
        { status: regex },
        { amount: regex },
        { unit: regex },
      ];
    }

    if (from && to) {
      const start = new Date(from);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(to);
      end.setUTCHours(23, 59, 59, 999);

      filter.createdDate = { $gte: start, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      customerOrder
        .find(filter)
        .sort({ createdDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      customerOrder.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Customer Orders listed successfully",
      data: users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching CustomerOrder" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const {
      username,
      unit,
      amount,
      received,
      balance,
      status,
      customerId,
      createdDate,
      updatedDate,
    } = req.body;

    if (!username)
      return res.status(400).json({ message: "CustomerName is required" });
    if (!unit) return res.status(400).json({ message: "Unit is required" });
    if (!amount) return res.status(400).json({ message: "Amount is required" });
    if (!status) return res.status(400).json({ message: "Status is required" });
    if (balance > 0 && status === "completed") {
      return res
        .status(400)
        .json({ message: "Balance should be zero to complete" });
    }

    const newOrder = new customerOrder({
      username,
      unit,
      amount,
      received,
      balance,
      status,
      createdDate: createdDate || undefined,
      updatedDate,
      customerId,
    });
    await newOrder.save();

    const newList = new customerList({
      unit,
      amount,
      received,
      balance,
      status,
      createdDate: createdDate || undefined,
      updatedDate,
      customerId,
      orderId: newOrder._id,
    });
    await newList.save();

    newOrder.listId = newList._id;
    await newOrder.save();

    res.status(201).json({
      message: "Customer Order  created successfully",
      data: newOrder,
    });
  } catch (err) {
    console.error("Error creating customer order:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const {
      username,
      unit,
      amount,
      received,
      balance,
      status,
      customerId,
      createdDate,
      updatedDate,
    } = req.body;
    const { id } = req.params;

    if (!username)
      return res.status(400).json({ message: "CustomerName is required" });
    if (!unit) return res.status(400).json({ message: "Unit is required" });
    if (!amount) return res.status(400).json({ message: "Amount is required" });
    if (!status) return res.status(400).json({ message: "Status is required" });

    if (balance > 0 && status === "completed") {
      return res
        .status(400)
        .json({ message: "Balance should be zero to complete" });
    }

    const updatedOrder = await customerOrder.findByIdAndUpdate(
      id,
      {
        username,
        unit,
        amount,
        received,
        balance,
        status,
        customerId,
        createdDate: createdDate || undefined,
        updatedDate,
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Customer Order not found" });
    }

    if (updatedOrder.listId) {
      await customerList.findByIdAndUpdate(
        updatedOrder.listId,
        {
          unit,
          amount,
          received,
          balance,
          status,
          customerId,
          createdDate: createdDate || undefined,
          updatedDate,
        },
        { new: true }
      );
    }

    res.status(200).json({
      message: "Customer Order  updated successfully",
      data: updatedOrder,
    });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ message: "Error updating Customer Order" });
  }
});

router.get("/info/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "CustomerOrder not found" });
    }
    const user = await customerOrder.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer Order  viewed successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching Customer Order" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await customerOrder.findByIdAndDelete(id);
    await customerList.deleteOne({ _id: deletedUser.listId });

    if (!deletedUser) {
      return res.status(404).json({ message: "Customer Order not found" });
    }
    res.status(200).json({
      message: "CustomerOrder deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting Customer Order" });
  }
});

module.exports = router;
