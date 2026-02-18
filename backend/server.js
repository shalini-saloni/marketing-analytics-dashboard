'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { testConnection } = require('./config/database');
const apiRouter          = require('./routes/api');

const app  = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ─── Middleware ──────────────────────────────────────────────────────────────

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET'],
  optionsSuccessStatus: 200,
}));

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  }
});

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error:   err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

(async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`\n Marketing Analytics API running at http://localhost:${PORT}`);
      console.log(`Dashboard: http://localhost:${PORT}/index.html`);
      console.log(`API Base:  http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('[FATAL] Could not start server:', err.message);
    process.exit(1);
  }
})();

module.exports = app; 
