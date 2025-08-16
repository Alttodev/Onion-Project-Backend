const express = require("express");
const customerList = require("../models/customerList");
const router = express.Router();

//get

router.get("/get/:id", async (req, res) => {
  try {
    const { search, date, page = 1, limit = 5 } = req.query;
    const { id } = req.params;
    let filter = { customerId: id };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ status: regex }, { amount: regex }];
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
      customerList.find(filter) .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
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
      unit,
      amount,
      received,
      balance,
      status,
      customerId,
      createdDate,
      updatedDate,
    } = req.body;

    if (!unit) {
      return res.status(400).json({ message: "Unit is required" });
    }

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (balance > 0 && status === "completed") {
      return res
        .status(400)
        .json({ message: "Balance should be zero to complete" });
    }

    const newCustomer = new customerList({
      unit,
      amount,
      received,
      balance,
      status: status || undefined,
      createdDate: createdDate || undefined,
      updatedDate: updatedDate || undefined,
      customerId,
    });
    await newCustomer.save();

    res.status(201).json({
      message: "Customer List created successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//update

router.put("/update/:id", async (req, res) => {
  try {
    const {
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

    if (!unit) {
      return res.status(400).json({ message: "Unit is required" });
    }
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }


    const user = await customerList.findByIdAndUpdate(
      id,
      {
        unit,
        amount,
        received,
        balance,
        customerId,
        status: status || undefined,
        createdDate: createdDate || undefined,
        updatedDate: updatedDate || undefined,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "Customer List not found" });
    }

    res.status(200).json({
      message: "Customer List updated successfully",
      data: user,
    });
  } catch (err) {
    console.error(err);
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
