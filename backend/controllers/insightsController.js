'use strict';

const Channel  = require('../models/Channel');
const Campaign = require('../models/Campaign');

async function getInsights(req, res, next) {
  try {
    const channels  = await Channel.findAll('roas', 'desc');
    const topCamps  = await Campaign.topByRoas(5);
    const underperf = await Campaign.underperforming(50000, 2.0);
    const scaling   = await Campaign.scalingOpportunities(5.0, 20000);

    const insights = [];

    for (const ch of channels) {
      const roas = Number(ch.roas);
      const spend = Number(ch.total_spend);

      if (roas >= 6) {
        insights.push(
          `📈 ${ch.name} delivers exceptional ROAS of ${roas}x. ` +
          `Consider increasing budget allocation to capitalise on strong returns.`
        );
      } else if (roas >= 4) {
        insights.push(
          `✅ ${ch.name} is performing well (ROAS ${roas}x). ` +
          `Maintain current strategy and explore audience expansion.`
        );
      } else if (roas >= 2 && roas < 3) {
        insights.push(
          `⚠️ ${ch.name} shows a below-target ROAS of ${roas}x. ` +
          `Review creative and targeting; consider A/B testing new approaches.`
        );
      } else if (roas < 2) {
        insights.push(
          `🔴 ${ch.name} is underperforming with ROAS ${roas}x. ` +
          `Audit campaign settings, pause low-quality ad sets, and realign with top-converting audiences.`
        );
      }
    }

    if (topCamps.length > 0) {
      const top = topCamps[0];
      insights.push(
        `🏆 Best campaign: "${top.campaign_name}" (${top.channel_name}) with ROAS ${Number(top.roas)}x. ` +
        `Use this as a creative and targeting benchmark for other campaigns.`
      );
    }

    if (underperf.length > 0) {
      const names = underperf.map(c => `"${c.campaign_name}"`).join(', ');
      insights.push(
        `🚨 ${underperf.length} campaign(s) have high spend (≥₹50k) but low ROAS (<2.0): ${names}. ` +
        `Immediate review recommended – pause or restructure these campaigns.`
      );
    }

    if (scaling.length > 0) {
      const names = scaling.map(c => `"${c.campaign_name}"`).join(', ');
      insights.push(
        `🚀 Scaling opportunities identified: ${names}. ` +
        `These campaigns show strong ROAS (≥5.0x) with low spend — increase budgets to scale performance.`
      );
    }

    const highRoasChannels = channels.filter(c => Number(c.roas) >= 5);
    const lowRoasChannels  = channels.filter(c => Number(c.roas) < 2);
    if (highRoasChannels.length && lowRoasChannels.length) {
      insights.push(
        `Budget reallocation opportunity: Shift 20-30% of spend from ` +
        `${lowRoasChannels.map(c => c.name).join(', ')} to ` +
        `${highRoasChannels.map(c => c.name).join(', ')} to improve overall portfolio ROAS.`
      );
    }

    res.json({
      insights,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getInsights };
