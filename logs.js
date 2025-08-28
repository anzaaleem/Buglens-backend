// routes/logs.js
const express = require('express');
const router = express.Router();

// ✅ Correct path (routes/ -> models/)
const ErrorLog = require('./models/ErrorLog');

// GET /logs?search=&url=&browser=&status=&from=&to=&page=1&limit=20&sortBy=server_received_at&order=desc
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      url,
      browser,
      status,
      from,
      to,
      page = 1,
      limit = 20,
      sortBy = 'server_received_at',
      order = 'desc',
    } = req.query;

    // ---- Filters ----
    const q = {};
    if (url) q.url = url;
    if (browser) q.browser = browser;
    if (status) q.status = Number(status);
    if (from || to) {
      q.server_received_at = {};
      if (from) q.server_received_at.$gte = new Date(from);
      if (to) q.server_received_at.$lte = new Date(to);
    }

    // ---- Text search ----
    const text = String(search).trim();
    const query = text ? { $and: [q, { $text: { $search: text } }] } : q;

    // ---- Pagination ----
    const pageNum = Math.max(1, parseInt(page, 10));
    const perPage = Math.min(100, Math.max(1, parseInt(limit, 10)));

    // ---- Sorting (whitelist to avoid injection) ----
    const allowedSort = new Set([
      'server_received_at',
      'status',
      'url',
      'browser',
      'message',
      'timestamp',   // client-provided time, if present
      'createdAt'    // from { timestamps: true }
    ]);
    const sortField = allowedSort.has(String(sortBy)) ? String(sortBy) : 'server_received_at';
    const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // ---- Query DB ----
    const [items, total] = await Promise.all([
      ErrorLog.find(query)
        .sort(sort)
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      ErrorLog.countDocuments(query),
    ]);

    // ---- Transform for UI (trim stack; ISO date) ----
    const cleanedItems = items.map((log) => ({
      ...log,
      _id: log._id.toString(),
      server_received_at: new Date(log.server_received_at).toISOString(),
      // canonical names that your Angular now expects:
      message: log.message ?? null,
      stack: log.stack ? String(log.stack).substring(0, 200) : null,
    }));

    res.json({
      items: cleanedItems,
      total,
      page: pageNum,
      pages: Math.ceil(total / perPage),
      sort: { by: sortField, order: sortOrder === 1 ? 'asc' : 'desc' },
    });
  } catch (err) {
    console.error('Failed to fetch logs:', err);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

module.exports = router;
