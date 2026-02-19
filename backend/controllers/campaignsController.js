const pool = require("../config/database");

exports.getCampaigns = async (req, res) => {
  try {
    const { channel, min_roas, max_roas } = req.query;
    const conditions = [];
    const params = [];

    if (channel) {
      conditions.push("channel_name = ?");
      params.push(channel);
    }
    if (min_roas !== undefined) {
      const val = parseFloat(min_roas);
      if (isNaN(val)) return res.status(400).json({ error: "min_roas must be a number." });
      conditions.push("roas >= ?");
      params.push(val);
    }
    if (max_roas !== undefined) {
      const val = parseFloat(max_roas);
      if (isNaN(val)) return res.status(400).json({ error: "max_roas must be a number." });
      conditions.push("roas <= ?");
      params.push(val);
    }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
    const [rows] = await pool.query(
      `SELECT id, channel_name, campaign_name, total_spend, total_revenue,
              conversions, roas, cpa, cpc
       FROM campaigns ${where}
       ORDER BY roas DESC`,
      params
    );

    res.json({ campaigns: rows });
  } catch (err) {
    console.error("[campaigns]", err.message);
    res.status(500).json({ error: "Failed to fetch campaign data." });
  }
};
