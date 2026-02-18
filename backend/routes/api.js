'use strict';

const express = require('express');
const router  = express.Router();

const { getSummary }   = require('../controllers/summaryController');
const { getChannels }  = require('../controllers/channelsController');
const { getMonthly }   = require('../controllers/monthlyController');
const { getCampaigns } = require('../controllers/campaignsController');
const { getInsights }  = require('../controllers/insightsController');

/**
 * @route GET /api/summary
 * @desc  Overall performance KPI metrics
 */
router.get('/summary', getSummary);

/**
 * @route GET /api/channels
 * @desc  All channel metrics (supports sort_by and order params)
 */
router.get('/channels', getChannels);

/**
 * @route GET /api/monthly
 * @desc  Monthly performance data (supports month=YYYY-MM filter)
 */
router.get('/monthly', getMonthly);

/**
 * @route GET /api/campaigns
 * @desc  Campaign data (supports channel, min_roas, max_roas filters)
 */
router.get('/campaigns', getCampaigns);

/**
 * @route GET /api/insights
 * @desc  Generated insights and recommendations
 */
router.get('/insights', getInsights);

/**
 * Catch-all for undefined API routes
 */
router.all('*', (req, res) => {
  res.status(404).json({
    error:   'API endpoint not found',
    path:    req.originalUrl,
    method:  req.method,
  });
});

module.exports = router;
