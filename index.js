// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectDB } = require('./config/db');

// Routers
const logsRouter = require('./logs');                 // GET /logs
const trackitRouter = require('./routes/trackit');   // POST /log-error/trackit/report
const statsRouter = require('./routes/stats');       // GET /stats/summary

const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.CORS_ORIGIN || '*';

async function start() {
  await connectDB(process.env.MONGO_URI);

  const app = express();

  app.use(helmet());
  app.use(cors({ origin: ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('tiny'));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/log-error/trackit', trackitRouter);
  app.use('/logs', logsRouter);
  app.use('/stats', statsRouter); // 👈 mount stats

  app.get('/', (_req, res) => res.send('BugLens log API up'));

  app.use((req, res) => res.status(404).json({ ok: false, error: 'Not found' }));
  app.use((err, _req, res, _next) => {
    console.error('API error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Server error' });
  });

  app.listen(PORT, () => console.log(`🚀 API running at http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error('Fatal bootstrap error:', e);
  process.exit(1);
});
