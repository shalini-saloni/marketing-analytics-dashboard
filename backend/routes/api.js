const express  = require("express");
const router   = express.Router();

const summaryCtrl   = require("../controllers/summaryController");
const channelsCtrl  = require("../controllers/channelsController");
const monthlyCtrl   = require("../controllers/monthlyController");
const campaignsCtrl = require("../controllers/campaignsController");
const insightsCtrl  = require("../controllers/insightsController");

router.get("/summary",   summaryCtrl.getSummary);
router.get("/channels",  channelsCtrl.getChannels);
router.get("/monthly",   monthlyCtrl.getMonthly);
router.get("/campaigns", campaignsCtrl.getCampaigns);
router.get("/insights",  insightsCtrl.getInsights);

router.use((req, res) => res.status(404).json({ error: "API endpoint not found." }));

module.exports = router;
