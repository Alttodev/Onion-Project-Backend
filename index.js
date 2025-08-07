const express = require('express')
require('dotenv').config();
const cors = require('cors')
const mongoose = require('mongoose');
const customerRouter = require('./routes/customerRoutes');


const MONGODB_URI = 'mongodb://localhost:27017/ONION-SHOP';



mongoose.connect(MONGODB_URI, {
})
  .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Failed to connect to MongoDB', error));
  
const app = express()

app.use(express.json());


app.use(cors({
   origin: "http://localhost:5173",
}))

const port = 4000

app.use('/customers', customerRouter);




app.listen(port, () => {
  console.log(`Port is running ${port}`)
})
