/**
 * Main application file
 * Sets up Express server and connects routes
 */

const express = require('express');
require('dotenv').config();
const emailRoutes = require('./routes/emailRoutes');
const respondRoutes = require('./routes/respondRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/emails', emailRoutes);
app.use('/respond', respondRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Email Reply API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 