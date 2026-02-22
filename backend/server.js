// server.js – Mpoly API entry point
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const delayMiddleware = require('./middleware/delay');
const authRoutes      = require('./routes/auth');
const usersRoutes     = require('./routes/users');
const recordsRoutes   = require('./routes/records');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Inject optional artificial delay via ?delay=<ms>
app.use(delayMiddleware);

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/users',   usersRoutes);
app.use('/api/records', recordsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, message: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(`✅  Mpoly API running on http://localhost:${PORT}`);
  console.log(`   Add ?delay=<ms> to any request to simulate latency.`);
});
