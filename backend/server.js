const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const laundryRoutes = require('./routes/laundryRoutes')
const orderRoutes = require('./routes/orderRoutes')
require('dotenv').config();


const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/items', laundryRoutes)
app.use('/orders', orderRoutes)

const adminRoutes =
require("./routes/adminRoutes");

app.use(
  "/admin",
  adminRoutes
);

app.get('/', (req, res) => {
    res.send("Server running...")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


