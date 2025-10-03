const mongoose = require('mongoose');
const ErrorLogSchema = new mongoose.Schema(
  {
    message:       { type: String, required: true },   // error message
    stack:         { type: String },                   // full stack trace
    fileName:      { type: String },
    lineNumber:    { type: Number },
    columnNumber:  { type: Number },
       // metadata
    browser:       { type: String },
    url:           { type: String },                   // page URL or route
    method:        { type: String, default: 'CLIENT' },
    status:        { type: Number },                   // HTTP status if server-side
    referer:       { type: String },
    // Timestamps
    timestamp:         { type: Date },                 // client-side time (from payload)
    server_received_at:{ type: Date, default: Date.now },
    // Optional: keep original payload for debugging / forensics
    raw: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Helpful indexes
ErrorLogSchema.index({ server_received_at: -1 });
ErrorLogSchema.index({ url: 1 });
ErrorLogSchema.index({ browser: 1 });
// Text search over key fields
ErrorLogSchema.index({ message: 'text', stack: 'text', url: 'text' });

module.exports = mongoose.model('ErrorLog', ErrorLogSchema);
