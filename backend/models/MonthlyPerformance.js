'use strict';

const { pool } = require('../config/database');

const MonthlyPerformance = {
  /**
   * Fetch all monthly records, optionally filtered by month string.
   * @param {string|null} month 
   * @returns {Promise<Array>}
   */
  async findAll(month = null) {
    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        const err = new Error('Invalid month format. Use YYYY-MM.');
        err.status = 400;
        throw err;
      }
      const [rows] = await pool.query(
        `SELECT id, month, total_spend, total_revenue, total_conversions, roas
         FROM monthly_performance
         WHERE month = ?
         ORDER BY month ASC`,
        [month]
      );
      return rows;
    }

    const [rows] = await pool.query(
      `SELECT id, month, total_spend, total_revenue, total_conversions, roas
       FROM monthly_performance
       ORDER BY month ASC`
    );
    return rows;
  },

  /**
   * Upsert a monthly_performance record.
   * @param {Object} data
   */
  async upsert(data) {
    const { month, total_spend, total_revenue, total_conversions, roas } = data;
    await pool.query(
      `INSERT INTO monthly_performance (month, total_spend, total_revenue, total_conversions, roas)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_spend       = VALUES(total_spend),
         total_revenue     = VALUES(total_revenue),
         total_conversions = VALUES(total_conversions),
         roas              = VALUES(roas)`,
      [month, total_spend, total_revenue, total_conversions, roas]
    );
  },
};

module.exports = MonthlyPerformance;
