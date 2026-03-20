const mongoose = require('mongoose');

async function connect() {
  const uri = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/watezero';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

module.exports = { connect };