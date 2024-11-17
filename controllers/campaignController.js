const Campaign = require("../models/campaign");
const Audience = require("../models/audience");
const CommunicationLog = require("../models/communicationLog");
const db = require("../config/db");

const listCampaigns = async (req, res) => {
  try {
    // if (!req.isAuthenticated()) {
    //   return res.redirect("/auth/google");
    // }
    const campaigns = await Campaign.getAll();
    console.log("Campaigns Data:", campaigns);
    res.render("campaign/index", { campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).send("Error fetching campaigns");
  }
};

const newCampaignForm = async (req, res) => {
  try {
    // if (!req.isAuthenticated()) {
    //   return res.redirect("/auth/google");
    // }
    const audiences = await Audience.getAll();
    res.render("campaign/new", { audiences });
  } catch (error) {
    console.error("Error loading campaign form:", error);
    res.status(500).send("Error loading campaign form");
  }
};

const createCampaign = async (req, res) => {
  try {
    // if (!req.isAuthenticated()) {
    //   return res.redirect("/auth/google");
    // }
    const { name, audience_id, sent_date } = req.body;
    const campaignId = await Campaign.create({ name, audience_id, sent_date });
    res.redirect(`/campaign/${campaignId}`);
  } catch (error) {
    res.status(500).send("Error creating campaign");
  }
};

const showCampaign = async (req, res) => {
  try {
    // if (!req.isAuthenticated()) {
    //   return res.redirect("/auth/google");
    // }
    const campaign = await Campaign.getById(req.params.id);
    if (!campaign) return res.status(404).send("Campaign not found");
    const communications = await CommunicationLog.getByAudienceId(
      campaign.audience_id
    );
    res.render("campaign/show", { campaign, communications });
  } catch (error) {
    res.status(500).send("Error fetching campaign details");
  }
};

module.exports = {
  listCampaigns,
  newCampaignForm,
  createCampaign,
  showCampaign,
};
