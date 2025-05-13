

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');  // File system for logging

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Optional: In-memory log storage (for quick access)
let errorLogs = [];

// Helper to append logs to file
function appendLogToFile(logEntry) {
  const line = JSON.stringify(logEntry) + '\n';
  fs.appendFile('error-logs.txt', line, (err) => {
    if (err) {
      console.error('Failed to write log to file:', err);
    }
  });
}

// Route to receive error logs (POST request)
app.post('/log-error', (req, res) => {
  const { message, stack, page } = req.body;
  const timestamp = new Date().toISOString();
  const logEntry = { message, stack, page, timestamp };

  console.log('📥 Error received:', logEntry);

  // Store in-memory
  errorLogs.push(logEntry);

  // Append to file for persistence
  appendLogToFile(logEntry);

  res.status(200).json({ message: 'Error logged successfully' });
});

// Route to retrieve all logs (GET request)
app.get('/log-error', (req, res) => {
  fs.readFile('error-logs.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read log file:', err);
      return res.status(500).json({ message: 'Failed to read logs' });
    }
    const logs = data
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry !== null);

    res.status(200).json(logs);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const fs = require('fs');  // File system for logging

// const app = express();
// const PORT = 3000;

// // Middlewares
// app.use(cors());
// app.use(bodyParser.json());

// // Optional: In-memory log storage (for quick access)
// let errorLogs = [];

// // Helper to append logs to file
// function appendLogToFile(logEntry) {
//   const line = JSON.stringify(logEntry) + '\n';
//   fs.appendFile('error-logs.txt', line, (err) => {
//     if (err) {
//       console.error('Failed to write log to file:', err);
//     }
//   });
// }

// // Route to receive error logs
// app.post('/log-error', (req, res) => {
//   const { message, stack, page } = req.body;
//   const timestamp = new Date().toISOString();
//   const logEntry = { message, stack, page, timestamp };

//   console.log('📥 Error received:', logEntry);

//   // Store in-memory
//   errorLogs.push(logEntry);

//   // Append to file for persistence
//   appendLogToFile(logEntry);

//   res.status(200).json({ message: 'Error logged successfully' });
// });

// // Route to retrieve all logs (from file)
// app.get('/log-error', (req, res) => {
//   fs.readFile('error-logs.txt', 'utf8', (err, data) => {
//     if (err) {
//       console.error('Failed to read log file:', err);
//       return res.status(500).json({ message: 'Failed to read logs' });
//     }
//     const logs = data
//       .split('\n')
//       .filter(line => line.trim())
//       .map(line => {
//         try {
//           return JSON.parse(line);
//         } catch {
//           return null;
//         }
//       })
//       .filter(entry => entry !== null);

//     res.status(200).json(logs);
//   });
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });



const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');  // File system for logging

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Optional: In-memory log storage (for quick access)
let errorLogs = [];

// Helper to append logs to file
function appendLogToFile(logEntry) {
  const line = JSON.stringify(logEntry) + '\n';
  fs.appendFile('error-logs.txt', line, (err) => {
    if (err) {
      console.error('Failed to write log to file:', err);
    }
  });
}

// Route to receive error logs (POST request)
app.post('/log-error', (req, res) => {
  const { message, stack, page } = req.body;
  const timestamp = new Date().toISOString();
  const logEntry = { message, stack, page, timestamp };

  console.log('📥 Error received:', logEntry);

  // Store in-memory
  errorLogs.push(logEntry);

  // Append to file for persistence
  appendLogToFile(logEntry);

  res.status(200).json({ message: 'Error logged successfully' });
});

// Route to retrieve all logs (GET request)
app.get('/log-error', (req, res) => {
  fs.readFile('error-logs.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read log file:', err);
      return res.status(500).json({ message: 'Failed to read logs' });
    }
    const logs = data
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry !== null);

    res.status(200).json(logs);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
