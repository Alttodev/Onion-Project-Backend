const express = require("express");
const router = express.Router();
const customerOrder = require("../models/customerOrder");
const Customer = require("../models/customer");
const ExcelJS = require("exceljs");

router.get("/excel", async (req, res) => {
  try {
    const { name, from, to } = req.query;
    let query = {};

    // Date filter
    if (from && to) {
      const start = new Date(from);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setUTCHours(23, 59, 59, 999);
      query.createdDate = { $gte: start, $lte: end };
    }

    // Fetch orders
    let orders = await customerOrder.find(query).lean();

    // Fetch customers
    const customerIds = orders.map((o) => o.customerId);
    const customers = await Customer.find({ _id: { $in: customerIds } }).lean();
    const customerMap = {};
    customers.forEach((c) => (customerMap[c._id] = c.username));
    orders = orders.map((o) => ({ ...o, username: customerMap[o.customerId] || "-" }));

    // Filter by name if provided
    if (name) {
      orders = orders.filter((o) => o.username.toLowerCase().includes(name.toLowerCase()));
    }

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Customer Orders");

    // Columns
    sheet.columns = [
      { header: "S.No", key: "sno", width: 10 },
      { header: "Customer", key: "customer", width: 25 },
      { header: "Kg", key: "unit", width: 15 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Received", key: "received", width: 15 },
      { header: "Balance", key: "balance", width: 15 },
      { header: "Purchased", key: "purchased", width: 20 },
      { header: "Completed", key: "completed", width: 20 },
    ];

    // Add rows
    orders.forEach((order, index) => {
      sheet.addRow({
        sno: index + 1,
        customer: order.username || "-",
        unit: order.unit || "-",
        amount: order.amount || "-",
        received: order.received || "-",
        balance: order.balance || "-",
        purchased: order.createdDate ? new Date(order.createdDate).toLocaleDateString() : "-",
        completed: order.updatedDate ? new Date(order.updatedDate).toLocaleDateString() : "-",
      });
    });

    // Styling (optional)
    sheet.getRow(1).font = { bold: true }; // header bold
    sheet.columns.forEach((col) => {
      col.alignment = { horizontal: "center" };
    });

    // Send Excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=orders_${name || "all"}_${from || "start"}_to_${to || "end"}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel Export Error:", err);
    res.status(500).json({ message: "Error exporting Excel" });
  }
});

module.exports = router;
