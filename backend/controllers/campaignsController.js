'use strict';

const Campaign = require('../models/Campaign');

async function getCampaigns(req, res, next) {
  try {
    const { channel, min_roas, max_roas } = req.query;

    if (min_roas !== undefined && isNaN(parseFloat(min_roas))) {
      return res.status(400).json({ error: 'min_roas must be a valid number.' });
    }
    if (max_roas !== undefined && isNaN(parseFloat(max_roas))) {
      return res.status(400).json({ error: 'max_roas must be a valid number.' });
    }
    if (min_roas && max_roas && parseFloat(min_roas) > parseFloat(max_roas)) {
      return res.status(400).json({ error: 'min_roas cannot be greater than max_roas.' });
    }

    const campaigns = await Campaign.findAll({
      channel:  channel  || null,
      min_roas: min_roas ?? null,
      max_roas: max_roas ?? null,
    });

    res.json({
      campaigns: campaigns.map(c => ({
        id:            c.id,
        channel_name:  c.channel_name,
        campaign_name: c.campaign_name,
        total_spend:   Number(c.total_spend),
        total_revenue: Number(c.total_revenue),
        conversions:   Number(c.conversions),
        roas:          Number(c.roas),
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCampaigns };
