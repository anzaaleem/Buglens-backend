// config/db.js
const mongoose = require('mongoose');

async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  mongoose.connection.on('connected', () => console.log('✅ Mongo connected'));
  mongoose.connection.on('error', (e) => console.error('❌ Mongo error', e));
  mongoose.connection.on('disconnected', () => console.warn('⚠️ Mongo disconnected'));
  await mongoose.connect(uri); // Mongoose v8: no need for legacy options
}

module.exports = { connectDB };
