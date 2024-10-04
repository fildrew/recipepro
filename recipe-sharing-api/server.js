const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth'); // Import auth routes
const recipeRoutes = require('./routes/recipes'); // Import recipe routes
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON requests
app.use(express.json());

// Define routes
app.use('/api/auth', authRoutes); // Use auth routes
app.use('/api/recipes', recipeRoutes); // Use recipe routes

// Start the server
const PORT = process.env.PORT || 5003;

// Export the app for testing
module.exports = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
