// routes/errorRoutes.js
const express = require('express');
const router = express.Router();
const ErrorLog = require('../models/ErrorLog');

// GET all error logs with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const logs = await ErrorLog.find()
      .sort({ server_received_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

module.exports = router;
