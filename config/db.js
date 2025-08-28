// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('Connected to MongoDB');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1); // Stop server if DB fails
//   }
// };

// module.exports = connectDB;

// db.js

require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // process.env.MONGO_URI will be your Atlas connection string
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Stop server if DB fails
  }
};

module.exports = connectDB;

