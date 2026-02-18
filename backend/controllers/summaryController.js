'use strict';

const Channel = require('../models/Channel');

async function getSummary(req, res, next) {
  try {
    const summary = await Channel.getSummary();
    res.json({
      total_spend:       Number(summary.total_spend)       || 0,
      total_revenue:     Number(summary.total_revenue)     || 0,
      total_conversions: Number(summary.total_conversions) || 0,
      overall_roas:      Number(summary.overall_roas)      || 0,
      overall_cpa:       Number(summary.overall_cpa)       || 0,
      overall_cpc:       Number(summary.overall_cpc)       || 0,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary };
