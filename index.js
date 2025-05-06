const express = require('express');
const connectDB = require('./config');
const todoRoutes = require('./routes/todoRoute');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(require('cors')());

// Routes
app.use('/api/todos', todoRoutes);

// Server
app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);
});