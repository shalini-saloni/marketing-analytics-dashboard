const pool = require("../config/database");

exports.getMonthly = async (req, res) => {
  try {
    const { month } = req.query;

    let query = `SELECT id, month, total_spend, total_revenue, total_conversions,
                        roas, mom_spend_pct, mom_revenue_pct
                 FROM monthly_performance`;
    const params = [];

    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: "Invalid month format. Use YYYY-MM." });
      }
      query += " WHERE month = ?";
      params.push(month);
    }

    query += " ORDER BY month ASC";

    const [rows] = await pool.query(query, params);
    res.json({ monthly_data: rows });
  } catch (err) {
    console.error("[monthly]", err.message);
    res.status(500).json({ error: "Failed to fetch monthly data." });
  }
};