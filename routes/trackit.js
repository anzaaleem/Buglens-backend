const router = require('express').Router();
const ErrorLog = require('../models/ErrorLog');

/**
 * Parse first occurrence of "file:line:column" from common stack formats.
 * Handles:
 *  - Chrome/V8: "at func (http://host/app.js:10:5)"
 *  - Firefox:   "func@http://host/app.js:10:5"
 *  - Node:      "at /path/app.js:10:5"
 */
function parseStackTrace(stack = '') {
  try {
    if (!stack) return {};
    // try multiple patterns
    const patterns = [
      /\(?([a-zA-Z0-9_:/.\-?&=#+%]+):(\d+):(\d+)\)?/, // http(s)://...:line:col
      /at\s+(?:.+?\s+)?\(?(.+?):(\d+):(\d+)\)?/,      // at file:line:col
      /@(.+?):(\d+):(\d+)/                             // func@file:line:col (Firefox)
    ];
    for (const re of patterns) {
      const m = stack.match(re);
      if (m) {
        return {
          fileName: m[1],
          lineNumber: Number(m[2]),
          columnNumber: Number(m[3]),
        };
      }
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Normalize string length to avoid gigantic payloads clogging DB/UI.
 */
function trimOrNull(v, max = 20000) {
  if (v == null) return null;
  const s = String(v);
  return s.length > max ? s.slice(0, max) : s;
}

// POST /log-error/trackit/report
router.post('/report', async (req, res) => {
  try {
    const b = req.body || {};

    // Accept field aliases from different clients
    const message = b.message ?? b.error_message ?? null;
    const stack   = b.stack ?? b.stack_trace ?? '';
    const browser = b.browser ?? b.user_agent ?? '';
    const url     = b.url ?? b.route ?? '';
    const method  = b.method ?? b.http_method ?? 'CLIENT';
    const status  = (b.status !== undefined && b.status !== null) ? Number(b.status) : undefined;
    const referer = b.referer ?? b.referrer ?? '';

    // Prefer an ISO/date-like client timestamp if present
    const clientTs = b.timestamp ? new Date(b.timestamp) : undefined;

    // ✅ Validation: message required; stack optional (many client errors lack full stack)
    if (!message) {
      return res.status(400).json({ ok: false, message: 'Message is required' });
    }

    // Parse file/line/col from stack
    const parsed = parseStackTrace(stack);
    // Build document (trim large strings for safety)
    const doc = new ErrorLog({
      message: trimOrNull(message, 4000),
      stack:   trimOrNull(stack, 20000),
      browser: trimOrNull(browser, 2000),
      url:     trimOrNull(url, 2000),
      method:  trimOrNull(method, 50),
      status,
      referer: trimOrNull(referer, 2000),

      fileName: parsed.fileName,
      lineNumber: parsed.lineNumber,
      columnNumber: parsed.columnNumber,

      timestamp: clientTs,                 // aligns with schema
      server_received_at: new Date(),      // server timestamp

      raw: b,                              // keep original payload
    });

    await doc.save();
    return res.status(201).json({ ok: true, id: String(doc._id) });
  } catch (err) {
    console.error('Failed to ingest log:', err);
    return res.status(500).json({ ok: false, message: 'Failed to ingest log' });
  }
});

module.exports = router;
