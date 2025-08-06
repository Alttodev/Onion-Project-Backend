const express = require('express')
// require('dotenv').config();
const cors = require('cors')
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/Shop';

// const usersRouter = require('./customer.js');

mongoose.connect(MONGODB_URI, {
})
  .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Failed to connect to MongoDB', error));
  
const app = express()

app.use(express.json());


app.use(cors({
   origin: "http://localhost:5174",
}))

const port = 3000

// app.use('/users', usersRouter);




app.listen(port, () => {
  console.log(`Port is running ${port}`)
})
