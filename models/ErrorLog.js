// const mongoose = require('mongoose');

// const ErrorLogSchema = new mongoose.Schema(
//   {
//     // keep names consistent with what you send from the frontend
//     message: { type: String, required: true },      // error message
//     stack: { type: String },                         // stack trace
//     fileName: { type: String },
//     lineNumber: { type: Number },
//     columnNumber: { type: Number },
//     browser: { type: String },                       // user agent parsed/whole string
//     url: { type: String },                           // page URL or route
//     method: { type: String },                        // GET/POST/CLIENT etc.
//     status: { type: Number },                        // HTTP status or 0
//     referer: { type: String },
//     timestamp: { type: Date },
//     raw: { type: mongoose.Schema.Types.Mixed },      // optional: keep original payload
//     server_received_at: { type: Date, default: Date.now }
//   },
//   { timestamps: true }
// );

// // helpful indexes
// ErrorLogSchema.index({ server_received_at: -1 });
// ErrorLogSchema.index({ url: 1 });
// ErrorLogSchema.index({ browser: 1 });
// ErrorLogSchema.index({ message: 'text', stack: 'text', url: 'text' });

// module.exports = mongoose.model('ErrorLog', ErrorLogSchema);



const mongoose = require('mongoose');

const ErrorLogSchema = new mongoose.Schema(
  {
    // Canonical fields (keep names consistent across FE/BE/DB)
    message:       { type: String, required: true },   // error message
    stack:         { type: String },                   // full stack trace (server or client)
    fileName:      { type: String },
    lineNumber:    { type: Number },
    columnNumber:  { type: Number },

    // Context / meta
    browser:       { type: String },                   // user agent or parsed browser
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
  { timestamps: true } // adds createdAt / updatedAt
);

// Helpful indexes
ErrorLogSchema.index({ server_received_at: -1 });
ErrorLogSchema.index({ url: 1 });
ErrorLogSchema.index({ browser: 1 });
// Text search over key fields
ErrorLogSchema.index({ message: 'text', stack: 'text', url: 'text' });

module.exports = mongoose.model('ErrorLog', ErrorLogSchema);
