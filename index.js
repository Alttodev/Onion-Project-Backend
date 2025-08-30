const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const customerRouter = require("./routes/customerRoutes");
const customerListRouter = require("./routes/customerListRoutes");
const userRouter = require("./routes/userRoutes");
const customerNameRouter = require("./routes/customerNameRoutes");
const customerOrderRouter = require("./routes/customerOrderRoutes");
const customerPdfRouter = require("./routes/customerPdfRoutes");

// const MONGODB_URI = "mongodb://localhost:27017/ONION-SHOP";
const MONGODB_URI = process.env.MONGO_URL;

mongoose
  .connect(MONGODB_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Failed to connect to MongoDB", error));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    // origin:"https://sma-traders.netlify.app",
    origin: "*",
    credentials: true,
  })
);

const port = 4000;

app.use("/customers", customerRouter);
app.use("/list", customerListRouter);
app.use("/user", userRouter);
app.use("/essential", customerNameRouter);
app.use("/order", customerOrderRouter);
app.use("/export", customerPdfRouter);

app.listen(port, async () => {
  console.log(`Port is running ${port}`);
});
