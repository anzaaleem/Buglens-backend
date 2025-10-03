// logs.js  (mounted at /logs)
const express = require('express');
const router = express.Router();
const ErrorLog = require('./models/ErrorLog');

// GET /logs?search=&url=&browser=&status=&from=&to=&page=1&limit=20&sortBy=server_received_at&order=desc&format=csv|json
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
      format = 'json'
    } = req.query;

    // Filters
    const filter = {};
    if (url) filter.url = url;
    if (browser) filter.browser = browser;
    if (status !== undefined) {
      const n = Number(status);
      if (!Number.isNaN(n)) filter.status = n;
    }
    if (from || to) {
      filter.server_received_at = {};
      if (from) filter.server_received_at.$gte = new Date(from);
      if (to)   filter.server_received_at.$lte = new Date(to);
    }

    // Text search
    const text = String(search).trim();
    const query = text ? { $and: [filter, { $text: { $search: text } }] } : filter;

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const perPage = Math.min(5000, Math.max(1, parseInt(limit, 10))); // allow bigger for export

    // Sorting (whitelist)
    const allowedSort = new Set([
      'server_received_at', 'status', 'url', 'browser', 'message', 'timestamp', 'createdAt'
    ]);
    const sortField = allowedSort.has(String(sortBy)) ? String(sortBy) : 'server_received_at';
    const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    if (String(format).toLowerCase() === 'csv') {
      // CSV export (stream)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="buglens-logs.csv"');
      const header = [
        'message','url','method','browser','status',
        'fileName','lineNumber','columnNumber',
        'timestamp','server_received_at'
      ];
      res.write(header.join(',') + '\n');

      const cursor = ErrorLog.find(query).sort(sort).limit(perPage).cursor();
      for await (const log of cursor) {
        const row = [
          log.message ?? '',
          log.url ?? '',
          log.method ?? '',
          log.browser ?? '',
          (log.status ?? '').toString(),
          log.fileName ?? '',
          (log.lineNumber ?? '').toString(),
          (log.columnNumber ?? '').toString(),
          log.timestamp ? new Date(log.timestamp).toISOString() : '',
          log.server_received_at ? new Date(log.server_received_at).toISOString() : ''
        ].map(v => `"${String(v).replace(/"/g, '""')}"`);
        res.write(row.join(',') + '\n');
      }
      return res.end();
    }

    // JSON (default)
    const [items, total] = await Promise.all([
      ErrorLog.find(query).sort(sort).skip((pageNum - 1) * perPage).limit(perPage).lean(),
      ErrorLog.countDocuments(query),
    ]);

    const cleanedItems = items.map((log) => ({
      ...log,
      _id: String(log._id),
      server_received_at: log.server_received_at
        ? new Date(log.server_received_at).toISOString()
        : null,
      stack: log.stack ?? null,
    }));

    res.json({
      items: cleanedItems,
      total,
      page: pageNum,
      pageSize: perPage,
      sort: { by: sortField, order: sortOrder === 1 ? 'asc' : 'desc' },
    });
  } catch (err) {
    console.error('Failed to fetch logs:', err);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

module.exports = router;
