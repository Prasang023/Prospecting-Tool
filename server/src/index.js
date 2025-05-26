require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');
const companyRoutes = require('./routes/companyRoutes');
const prospectRoutes = require('./routes/prospectRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Company Prospecting Tool API' });
});

// Start server
const PORT = process.env.PORT || 8000;
app.use('/api/companies', companyRoutes);
app.use('/api/prospects', prospectRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 