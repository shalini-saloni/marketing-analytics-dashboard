require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../config/database");
const fs   = require("fs");
const path = require("path");

const dataFile = process.argv[2] || path.join(__dirname, "..", "summary_data.json");

async function importData() {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
    console.log(` Loaded ${dataFile}`);
  } catch (e) {
    console.error("ERROR: Cannot read summary_data.json –", e.message);
    process.exit(1);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("TRUNCATE TABLE channels");
    for (const ch of data.channels) {
      await conn.query(
        `INSERT INTO channels (name, total_spend, total_revenue, total_conversions,
                               roas, cpa, cpc, avg_ctr, avg_cvr)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ch.channel, ch.total_spend, ch.total_revenue, ch.total_conversions,
         ch.roas, ch.cpa, ch.cpc, ch.avg_ctr ?? 0, ch.avg_cvr ?? 0]
      );
    }
    console.log(`Imported ${data.channels.length} channels`);

    await conn.query("TRUNCATE TABLE monthly_performance");
    for (const m of data.monthly_data) {
      await conn.query(
        `INSERT INTO monthly_performance (month, total_spend, total_revenue,
                                          total_conversions, roas,
                                          mom_spend_pct, mom_revenue_pct)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [m.month, m.total_spend, m.total_revenue, m.total_conversions,
         m.roas, m.mom_spend_pct ?? null, m.mom_revenue_pct ?? null]
      );
    }
    console.log(`Imported ${data.monthly_data.length} monthly records`);

    await conn.query("TRUNCATE TABLE campaigns");
    for (const c of data.campaigns) {
      await conn.query(
        `INSERT INTO campaigns (channel_name, campaign_name, total_spend,
                                total_revenue, conversions, roas, cpa, cpc)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.channel, c.campaign_name, c.total_spend, c.total_revenue,
         c.total_conversions, c.roas, c.cpa, c.cpc]
      );
    }
    console.log(`Imported ${data.campaigns.length} campaigns`);

    await conn.query("TRUNCATE TABLE insights");
    for (const insight of data.insights) {
      await conn.query(
        "INSERT INTO insights (content, generated_at) VALUES (?, ?)",
        [insight, data.generated_at.replace("Z", "").replace("T", " ")]
      );
    }
    console.log(`Imported ${data.insights.length} insights`);

    await conn.commit();
    console.log("\n Data import complete!\n");
  } catch (err) {
    await conn.rollback();
    console.error("ERROR during import:", err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

importData();
