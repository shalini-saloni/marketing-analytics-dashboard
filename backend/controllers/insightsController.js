const pool = require("../config/database");

exports.getInsights = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT content, generated_at FROM insights ORDER BY id ASC"
    );
    const insights     = rows.map(r => r.content);
    const generated_at = rows.length ? rows[0].generated_at : new Date().toISOString();
    res.json({ insights, generated_at });
  } catch (err) {
    console.error("[insights]", err.message);
    res.status(500).json({ error: "Failed to fetch insights." });
  }
};