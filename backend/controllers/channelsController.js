'use strict';

const Channel = require('../models/Channel');

async function getChannels(req, res, next) {
  try {
    const { sort_by = 'roas', order = 'desc' } = req.query;

    const colMap = {
      roas:        'roas',
      spend:       'total_spend',
      revenue:     'total_revenue',
      conversions: 'total_conversions',
      cpa:         'cpa',
      cpc:         'cpc',
    };

    const sortCol = colMap[sort_by] || 'roas';

    if (!['asc', 'desc'].includes(order.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid order parameter. Use "asc" or "desc".',
      });
    }

    const channels = await Channel.findAll(sortCol, order);

    res.json({
      channels: channels.map(ch => ({
        id:                ch.id,
        name:              ch.name,
        total_spend:       Number(ch.total_spend),
        total_revenue:     Number(ch.total_revenue),
        total_conversions: Number(ch.total_conversions),
        roas:              Number(ch.roas),
        cpa:               Number(ch.cpa),
        cpc:               Number(ch.cpc),
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getChannels };
