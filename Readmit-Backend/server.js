const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
// const predictionRoutes = require('./routes/predictions');
const stats = require('./routes/stats');
const recommendationsRoutes = require('./routes/recommendations');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected to ReAdmit-DB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
// app.use('/api/predict', predictionRoutes);
app.use('/api/stats', stats);
app.use('/api/recommendations', recommendationsRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
