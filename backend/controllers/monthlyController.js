'use strict';

const MonthlyPerformance = require('../models/MonthlyPerformance');

async function getMonthly(req, res, next) {
  try {
    const { month } = req.query;
    const data = await MonthlyPerformance.findAll(month || null);

    res.json({
      monthly_data: data.map(row => ({
        id:                row.id,
        month:             row.month,
        total_spend:       Number(row.total_spend),
        total_revenue:     Number(row.total_revenue),
        total_conversions: Number(row.total_conversions),
        roas:              Number(row.roas),
      })),
    });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = { getMonthly };
