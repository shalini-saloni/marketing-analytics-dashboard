'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs      = require('fs');
const path    = require('path');
const { pool, testConnection } = require('../config/database');
const Channel          = require('../models/Channel');
const MonthlyPerformance = require('../models/MonthlyPerformance');
const Campaign         = require('../models/Campaign');

const DATA_PATH = process.argv[2]
  || path.join(__dirname, '..', '..', 'data', 'summary_data.json');


function safeNum(v, def = 0) {
  const n = parseFloat(v);
  return isNaN(n) ? def : n;
}

function safeInt(v, def = 0) {
  const n = parseInt(v, 10);
  return isNaN(n) ? def : n;
}


async function run() {
  await testConnection();
  console.log(`[Import] Reading data from: ${DATA_PATH}`);

  if (!fs.existsSync(DATA_PATH)) {
    console.error(`[Import] File not found: ${DATA_PATH}`);
    process.exit(1);
  }

  const raw  = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(raw);

  const channelSummary = data.channel_summary || data.channels || [];
  console.log(`[Import] Importing ${channelSummary.length} channel(s)…`);

  for (const ch of channelSummary) {
    await Channel.upsert({
      name:              ch.channel || ch.name,
      total_spend:       safeNum(ch.total_spend),
      total_revenue:     safeNum(ch.total_revenue),
      total_conversions: safeInt(ch.total_conversions),
      roas:              safeNum(ch.roas),
      cpa:               safeNum(ch.cpa || ch.cost_per_acquisition),
      cpc:               safeNum(ch.cpc || ch.cost_per_click),
    });
    console.log(`Channel: ${ch.channel || ch.name}`);
  }

  const monthlySummary = data.monthly_summary || data.monthly || [];
  console.log(`[Import] Importing ${monthlySummary.length} monthly record(s)…`);

  for (const m of monthlySummary) {
    await MonthlyPerformance.upsert({
      month:             m.month,
      total_spend:       safeNum(m.total_spend),
      total_revenue:     safeNum(m.total_revenue),
      total_conversions: safeInt(m.total_conversions),
      roas:              safeNum(m.roas),
    });
    console.log(`Month: ${m.month}`);
  }

  const campaignSummary = data.campaign_summary || data.campaigns || [];
  console.log(`[Import] Importing ${campaignSummary.length} campaign(s)…`);

  for (const c of campaignSummary) {
    await Campaign.upsert({
      channel_name:  c.channel || c.channel_name,
      campaign_name: c.campaign_name,
      total_spend:   safeNum(c.total_spend),
      total_revenue: safeNum(c.total_revenue),
      conversions:   safeInt(c.conversions || c.total_conversions),
      roas:          safeNum(c.roas),
    });
    console.log(`Campaign: ${c.campaign_name}`);
  }

  console.log('\n  Data import complete!');
  await pool.end();
}

run().catch(err => {
  console.error('[Import] Fatal error:', err.message);
  process.exit(1);
});
