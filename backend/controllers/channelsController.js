const pool = require("../config/database");

const ALLOWED_SORT = ["roas", "total_spend", "total_revenue", "total_conversions", "cpa", "cpc"];
const ALLOWED_ORDER = ["asc", "desc"];

exports.getChannels = async (req, res) => {
  try {
    let { sort_by = "roas", order = "desc" } = req.query;

    if (!ALLOWED_SORT.includes(sort_by)) {
      return res.status(400).json({ error: `Invalid sort_by. Allowed: ${ALLOWED_SORT.join(", ")}` });
    }
    if (!ALLOWED_ORDER.includes(order)) {
      return res.status(400).json({ error: "Invalid order. Use 'asc' or 'desc'." });
    }

    const [rows] = await pool.query(
      `SELECT id, name, total_spend, total_revenue, total_conversions,
              roas, cpa, cpc, avg_ctr, avg_cvr
       FROM channels
       ORDER BY \`${sort_by}\` ${order.toUpperCase()}`
    );

    res.json({ channels: rows });
  } catch (err) {
    console.error("[channels]", err.message);
    res.status(500).json({ error: "Failed to fetch channel data." });
  }
};
