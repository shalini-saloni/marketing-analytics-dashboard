const pool = require("../config/database");

exports.getSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        SUM(total_spend)       AS total_spend,
        SUM(total_revenue)     AS total_revenue,
        SUM(total_conversions) AS total_conversions
      FROM channels
    `);

    const data = rows[0] || {};

    const totalSpend = Number(data.total_spend) || 0;
    const totalRevenue = Number(data.total_revenue) || 0;
    const totalConversions = Number(data.total_conversions) || 0;

    const overall_roas = totalSpend ? totalRevenue / totalSpend : 0;
    const overall_cpa  = totalConversions ? totalSpend / totalConversions : 0;

    res.json({
      total_spend: totalSpend,
      total_revenue: totalRevenue,
      total_conversions: totalConversions,
      overall_roas: Number(overall_roas.toFixed(4)),
      overall_cpa: Number(overall_cpa.toFixed(2)),
      overall_cpc: 0 // since clicks not stored in DB
    });

  } catch (err) {
    console.error("[summary error]", err);
    res.status(500).json({ error: err.message });
  }
};
