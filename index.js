
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const logsRouter = require('./logs');       // for listing/stats
const trackitRouter = require('./routes/trackit'); // NEW: for ingest

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB connection failed:', err); process.exit(1); });

// 👇 This matches your frontend baseURL + path exactly:
app.use('/log-error/trackit', trackitRouter); // POST /log-error/trackit/report

// Keep existing read/stats endpoints for dashboard:
app.use('/logs', logsRouter);

app.get('/', (_req, res) => res.send('BugLens log API up'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
