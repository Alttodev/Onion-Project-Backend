const express = require("express");
const customerList = require("../models/customerList");
const customerOrder = require("../models/customerOrder");
const router = express.Router();

//get

router.get("/get/:id", async (req, res) => {
  try {
    const { search, date, page = 1, limit = 5 } = req.query;
    const { id } = req.params;
    let filter = { customerId: id };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ status: regex }, { amount: regex }, { unit: regex }];
    }

    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      filter.createdDate = { $gte: start, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      customerList
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      customerList.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Customer List listed successfully",
      data: users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching CustomerList" });
  }
});

//post

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

    if (!unit) return res.status(400).json({ message: "Unit is required" });
    if (!amount) return res.status(400).json({ message: "Amount is required" });
    if (!status) return res.status(400).json({ message: "Status is required" });
    if (balance > 0 && status === "completed") {
      return res
        .status(400)
        .json({ message: "Balance should be zero to complete" });
    }

    const newList = new customerList({
      username,
      unit,
      amount,
      received,
      balance,
      status,
      createdDate,
      updatedDate,
      customerId,
    });
    await newList.save();

    const newOrder = new customerOrder({
      username,
      unit,
      amount,
      received,
      balance,
      status,
      createdDate,
      updatedDate,
      customerId,
      listId: newList._id,
    });
    await newOrder.save();

    newList.orderId = newOrder._id;
    await newList.save();

    res.status(201).json({
      message: "Customer List  created successfully",
      data: newList,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//update

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

    if (!unit) return res.status(400).json({ message: "Unit is required" });
    if (!amount) return res.status(400).json({ message: "Amount is required" });
    if (!status) return res.status(400).json({ message: "Status is required" });

    if (balance > 0 && status === "completed") {
      return res
        .status(400)
        .json({ message: "Balance should be zero to complete" });
    }

    const updatedList = await customerList.findByIdAndUpdate(
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

    if (!updatedList) {
      return res.status(404).json({ message: "Customer List not found" });
    }

    if (updatedList.orderId) {
      await customerOrder.findByIdAndUpdate(
        updatedList.orderId,
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
    }

    res.status(200).json({
      message: "Customer List  updated successfully",
      data: updatedList,
    });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ message: "Error updating Customer List" });
  }
});

//info
router.get("/info/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "CustomerList not found" });
    }
    const user = await customerList.findById(id);

    if (!user) {
      return res.status(404).json({ message: "CustomerList not found" });
    }

    res.status(200).json({
      message: "Customer List  viewed successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching Customer List" });
  }
});

//delete

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await customerList.findByIdAndDelete(id);
    await customerOrder.deleteOne({ _id: deletedUser.orderId });

    if (!deletedUser) {
      return res.status(404).json({ message: "Customer List not found" });
    }
    res.status(200).json({
      message: "CustomerList deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting Customer List" });
  }
});

module.exports = router;
