const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const customerRouter = require("./routes/customerRoutes");
const customerListRouter = require("./routes/CustomerListRoutes")
const userRouter = require("./routes/userRoutes")


// const MONGODB_URI = "mongodb://localhost:27017/ONION-SHOP";
const MONGODB_URI = "mongodb+srv://Altto:Altto1997@cluster0.ijrvauo.mongodb.net/Onion-Project";

mongoose
  .connect(MONGODB_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Failed to connect to MongoDB", error));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    // origin: ["http://localhost:5173", "https://fun-content-fowl.ngrok-free.app"],
    origin: "*",
    // credentials: true,
  })
);


const port = 3000;

app.use("/customers", customerRouter);
app.use("/list", customerListRouter);
app.use("/user", userRouter);


app.listen(port, async () => {
  console.log(`Port is running ${port}`);
  
});
