'use strict';

const { pool } = require('../config/database');

const Campaign = {
  /**
   * Fetch campaigns with optional filters.
   * @param {Object} filters
   * @param {string|null} filters.channel  
   * @param {number|null} filters.min_roas 
   * @param {number|null} filters.max_roas 
   * @returns {Promise<Array>}
   */
  async findAll({ channel = null, min_roas = null, max_roas = null } = {}) {
    const conditions = [];
    const params = [];

    if (channel) {
      conditions.push('channel_name = ?');
      params.push(channel);
    }
    if (min_roas !== null && !isNaN(min_roas)) {
      conditions.push('roas >= ?');
      params.push(parseFloat(min_roas));
    }
    if (max_roas !== null && !isNaN(max_roas)) {
      conditions.push('roas <= ?');
      params.push(parseFloat(max_roas));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT id, channel_name, campaign_name, total_spend, total_revenue, conversions, roas
       FROM campaigns
       ${where}
       ORDER BY roas DESC`,
      params
    );
    return rows;
  },

  /**
   * Top N campaigns by ROAS.
   * @param {number} limit
   */
  async topByRoas(limit = 5) {
    const [rows] = await pool.query(
      `SELECT id, channel_name, campaign_name, total_spend, total_revenue, conversions, roas
       FROM campaigns
       ORDER BY roas DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  /**
   * Underperforming campaigns: high spend, low ROAS.
   * @param {number} minSpend   
   * @param {number} maxRoas    
   */
  async underperforming(minSpend = 50000, maxRoas = 2.0) {
    const [rows] = await pool.query(
      `SELECT id, channel_name, campaign_name, total_spend, total_revenue, conversions, roas
       FROM campaigns
       WHERE total_spend >= ? AND roas < ?
       ORDER BY total_spend DESC`,
      [minSpend, maxRoas]
    );
    return rows;
  },

  /**
   * Scaling opportunities: excellent ROAS but low spend.
   * @param {number} minRoas  
   * @param {number} maxSpend 
   */
  async scalingOpportunities(minRoas = 5.0, maxSpend = 20000) {
    const [rows] = await pool.query(
      `SELECT id, channel_name, campaign_name, total_spend, total_revenue, conversions, roas
       FROM campaigns
       WHERE roas >= ? AND total_spend <= ?
       ORDER BY roas DESC`,
      [minRoas, maxSpend]
    );
    return rows;
  },

  /**
   * Upsert a campaign record.
   * @param {Object} data
   */
  async upsert(data) {
    const { channel_name, campaign_name, total_spend, total_revenue, conversions, roas } = data;
    await pool.query(
      `INSERT INTO campaigns (channel_name, campaign_name, total_spend, total_revenue, conversions, roas)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_spend   = VALUES(total_spend),
         total_revenue = VALUES(total_revenue),
         conversions   = VALUES(conversions),
         roas          = VALUES(roas)`,
      [channel_name, campaign_name, total_spend, total_revenue, conversions, roas]
    );
  },
};

module.exports = Campaign;
