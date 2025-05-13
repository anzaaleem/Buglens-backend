const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Optional: In-memory log storage
let errorLogs = [];

// Helper to append logs to a file
function appendLogToFile(logEntry) {
  const line = JSON.stringify(logEntry) + '\n';
  fs.appendFile('error-logs.txt', line, (err) => {
    if (err) {
      console.error('❌ Failed to write log to file:', err);
    }
  });
}

// Route to receive error logs from Angular frontend
app.post('/log-error', (req, res) => {
  const {
    message = 'No message',
    stack_trace = '',
    route = '',
    user_agent = '',
    referer = '',
    method = 'POST',
    timestamp = new Date().toISOString()
  } = req.body;

  const logEntry = {
    message,
    stack_trace,
    route,
    user_agent,
    referer,
    method,
    timestamp
  };

  console.log('📥 Error received:', logEntry);

  errorLogs.push(logEntry);          // In-memory storage
  appendLogToFile(logEntry);         // Persist to file

  res.status(200).json({ message: 'Error logged successfully' });
});

// Route to fetch all error logs
// Route to retrieve all logs
app.get('/log-error', (req, res) => {
  fs.readFile('error-logs.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Failed to read log file:', err);
      return res.status(500).json({ message: 'Failed to read logs' });
    }

    const logs = data
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.warn('⚠️ Skipping malformed log line:', line);
          return null;
        }
      })
      .filter(entry => entry !== null);

    res.status(200).json(logs);
  });
});


// Catch-all route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
