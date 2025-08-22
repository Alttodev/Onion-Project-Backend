const express = require("express");
const router = express.Router();
const customerOrder = require("../models/customerOrder");
const PDFDocument = require("pdfkit");

router.get("/pdf", async (req, res) => {
  try {
    const { name, from, to } = req.query;
    let query = {};

    if (from && to) {
      const start = new Date(from);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setUTCHours(23, 59, 59, 999);
      query.createdDate = { $gte: start, $lte: end };
    }

    if (name) {
      query.username = { $regex: name, $options: "i" };
    }

    const orders = await customerOrder.find(query);

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");

    const filenameParts = [
      "orders",
      name ? name : "all",
      from ? from : "start",
      to ? to : "end",
    ];
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filenameParts.join("_")}.pdf`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(16).text("Customer Orders Report", { align: "center" });
    if (name) {
      doc.moveDown(0.5).fontSize(12).text(`Customer: ${name}`, { align: "center" });
    }
    doc.moveDown(2);

    // Table Config
    const tableTop = 120;
    const rowHeight = 22;
    const colWidths = [35, 90, 55, 55, 55, 55, 75, 75];
    const columns = [
      "S.No",
      "Customer",
      "Kg",
      "Amount",
      "Received",
      "Balance",
      "Purchased",
      "Completed",
    ];

    let x = 40;
    let y = tableTop;

    doc.fontSize(9).font("Helvetica-Bold");
    columns.forEach((col, i) => {
      doc.text(col, x + 2, y + 6, { width: colWidths[i], align: "center" });
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      x += colWidths[i];
    });

    y += rowHeight;
    doc.fontSize(8).font("Helvetica");

    orders.forEach((order, i) => {
      x = 40;
      const rowData = [
        i + 1,
        order.username || "-",
        order.unit || "-",
        order.amount || "-",
        order.received || "-",
        order.balance || "-",
        order.createdDate
          ? new Date(order.createdDate).toLocaleDateString()
          : "-",
        order.updatedDate
          ? new Date(order.updatedDate).toLocaleDateString()
          : "-",
      ];

      rowData.forEach((data, j) => {
        doc.text(String(data), x + 2, y + 6, {
          width: colWidths[j],
          align: "center",
        });
        doc.rect(x, y, colWidths[j], rowHeight).stroke();
        x += colWidths[j];
      });

      y += rowHeight;

      if (y > 750) {
        doc.addPage();
        y = tableTop;

        x = 40;
        doc.fontSize(9).font("Helvetica-Bold");
        columns.forEach((col, i) => {
          doc.text(col, x + 2, y + 6, { width: colWidths[i], align: "center" });
          doc.rect(x, y, colWidths[i], rowHeight).stroke();
          x += colWidths[i];
        });

        y += rowHeight;
        doc.fontSize(8).font("Helvetica");
      }
    });

    doc.end();
  } catch (err) {
    console.error("PDF Export Error:", err);
    res.status(500).json({ message: "Error exporting PDF" });
  }
});

module.exports = router;
