const pool = require("../config/database");

exports.getSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        SUM(total_spend)       AS total_spend,
        SUM(total_revenue)     AS total_revenue,
        SUM(total_conversions) AS total_conversions,
        SUM(total_revenue) / NULLIF(SUM(total_spend), 0)       AS overall_roas,
        SUM(total_spend)  / NULLIF(SUM(total_conversions), 0)  AS overall_cpa,
        SUM(total_spend)  / NULLIF(SUM(total_conversions), 0)  AS overall_cpc
      FROM channels
    `);

    const data = rows[0];
    res.json({
      total_spend:        parseFloat(data.total_spend)       || 0,
      total_revenue:      parseFloat(data.total_revenue)     || 0,
      total_conversions:  parseInt(data.total_conversions)   || 0,
      overall_roas:       parseFloat(data.overall_roas?.toFixed(4)) || 0,
      overall_cpa:        parseFloat(data.overall_cpa?.toFixed(2))  || 0,
      overall_cpc:        parseFloat(data.overall_cpc?.toFixed(2))  || 0,
    });
  } catch (err) {
    console.error("[summary]", err.message);
    res.status(500).json({ error: "Failed to fetch summary metrics." });
  }
};