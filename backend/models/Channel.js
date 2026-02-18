'use strict';

const { pool } = require('../config/database');

const Channel = {
  /**
   * Fetch all channels with optional sorting.
   * @param {string} sortBy  
   * @param {string} order   
   * @returns {Promise<Array>}
   */
  async findAll(sortBy = 'roas', order = 'desc') {
    const ALLOWED_SORT = ['roas', 'total_spend', 'total_revenue', 'total_conversions', 'cpa', 'cpc'];
    const ALLOWED_ORDER = ['asc', 'desc'];

    const col = ALLOWED_SORT.includes(sortBy) ? sortBy : 'roas';
    const dir = ALLOWED_ORDER.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

    const [rows] = await pool.query(
      `SELECT id, name, total_spend, total_revenue, total_conversions,
              roas, cpa, cpc
       FROM channels
       ORDER BY ${col} ${dir}`
    );
    return rows;
  },

  /**
   * Fetch a single channel by name.
   * @param {string} name
   * @returns {Promise<Object|null>}
   */
  async findByName(name) {
    const [rows] = await pool.query(
      'SELECT * FROM channels WHERE name = ? LIMIT 1',
      [name]
    );
    return rows[0] || null;
  },

  /**
   * Get aggregate summary across all channels.
   * @returns {Promise<Object>}
   */
  async getSummary() {
    const [rows] = await pool.query(
      `SELECT
         SUM(total_spend)                                  AS total_spend,
         SUM(total_revenue)                                AS total_revenue,
         SUM(total_conversions)                            AS total_conversions,
         ROUND(SUM(total_revenue) / NULLIF(SUM(total_spend), 0), 2) AS overall_roas,
         ROUND(SUM(total_spend)   / NULLIF(SUM(total_conversions), 0), 2) AS overall_cpa,
         ROUND(SUM(total_spend)   / NULLIF(
           (SELECT SUM(c2.total_spend / NULLIF(c2.cpc, 0))
            FROM channels c2), 0), 2) AS overall_cpc
       FROM channels`
    );

    const [clickRows] = await pool.query(
      `SELECT ROUND(SUM(total_spend) /
        NULLIF(SUM(CASE WHEN cpc > 0 THEN total_spend / cpc ELSE 0 END), 0), 2) AS overall_cpc
       FROM channels`
    );

    return {
      ...rows[0],
      overall_cpc: clickRows[0]?.overall_cpc ?? 0,
    };
  },

  /**
   * Upsert a channel record (insert or update by name).
   * @param {Object} data
   */
  async upsert(data) {
    const { name, total_spend, total_revenue, total_conversions, roas, cpa, cpc } = data;
    await pool.query(
      `INSERT INTO channels (name, total_spend, total_revenue, total_conversions, roas, cpa, cpc)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_spend       = VALUES(total_spend),
         total_revenue     = VALUES(total_revenue),
         total_conversions = VALUES(total_conversions),
         roas              = VALUES(roas),
         cpa               = VALUES(cpa),
         cpc               = VALUES(cpc)`,
      [name, total_spend, total_revenue, total_conversions, roas, cpa, cpc]
    );
  },
};

module.exports = Channel;
