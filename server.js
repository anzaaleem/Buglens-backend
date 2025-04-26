const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// POST /log-error: receive error logs
app.post('/log-error', (req, res) => {
  const { message, stack, page } = req.body;
  const timestamp = new Date().toISOString();
  const logEntry = { message, stack, page, timestamp };

  console.log('📥 Error received:', logEntry);

  // Append to file
  fs.appendFile('error-logs.txt', JSON.stringify(logEntry) + '\n', (err) => {
    if (err) {
      console.error('Failed to write log to file:', err);
      return res.status(500).json({ message: 'Failed to log error' });
    }
    res.status(200).json({ message: 'Error logged successfully' });
  });
});

// GET /log-error: return logged errors
app.get('/log-error', (req, res) => {
  fs.readFile('error-logs.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read log file:', err);
      return res.status(500).json({ message: 'Failed to read logs' });
    }
    const logs = data
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
    res.status(200).json(logs);
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
