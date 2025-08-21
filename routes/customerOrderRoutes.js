
const router = express.Router();

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