// const express = require('express');
// const router = express.Router();
// const ErrorLog = require('../models/ErrorLog');

// // POST log
// router.post('log-error/trackit/report', async (req, res) => {
//   try {
//     const { message, stack, url, severity, browser } = req.body;
//     const newLog = new ErrorLog({ message, stack, url, severity, browser });
//     await newLog.save();
//     res.status(200).json({ message: 'Log saved successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to save log', error: err });
//   }
// });

// // GET logs
// router.get('/', async (req, res) => {
//   try {
//     const logs = await ErrorLog.find().sort({ timestamp: -1 });
//     res.status(200).json(logs);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch logs' });
//   }
// });

// module.exports = router;


// routes/logRoutes.js
const express = require('express');
const router = express.Router();
const ErrorLog = require('../models/ErrorLog');

// POST /log-error/custom
router.post('/log-error/custom', async (req, res) => {
  try {
    const { message, stack, url, severity, browser } = req.body;
    if (!message || !stack) {
      return res.status(400).json({ message: 'Message and Stack are required' });
    }

    const newLog = new ErrorLog({ message, stack, url, severity, browser });
    await newLog.save();
    res.status(200).json({ message: 'Log saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save log', error: err });
  }
});

// GET logs with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const logs = await ErrorLog.find()
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

module.exports = router;
