const CommunicationLog = require("../models/communicationLog");
const Customer = require("../models/customer");
const db = require("../config/db");

const sendMessage = async (req, res) => {
  try {
    const { audience_name, emails } = req.body;
    if (!emails) {
      return res.status(400).json({ error: "Customer emails are required." });
    }

    const audience = await db.query(
      "SELECT audience_id FROM audiences WHERE name = ?",
      [audience_name]
    );

    if (!audience || audience.length === 0) {
      return res.status(404).json({ error: "Audience not found." });
    }

    const audience_id = audience[0].audience_id;

    const emailList = emails.split(",").map((email) => email.trim());
    const customers = await Customer.getByEmails(emailList);

    if (!customers || customers.length === 0) {
      return res
        .status(404)
        .json({ error: "No customers found for the given emails." });
    }
    for (const customer of customers) {
      const message = `Hi ${customer.name}, here’s 10% off on your next order!`;

      const logId = await CommunicationLog.logMessage({
        audience_id: audience_id,
        customer_id: customer.customer_id,
        message,
      });
      const status = Math.random() < 0.9 ? "SENT" : "FAILED";
      await CommunicationLog.updateStatus(logId, status);
    }
    res.redirect("/communication");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDeliveryStatus = async (req, res) => {
  const { log_id, status } = req.body;
  try {
    const result = await CommunicationLog.updateStatus(log_id, status);
    res.status(200).json({ message: "Status queued for update " });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const showCampaignPage = async (req, res) => {
  const audience_id = req.params.audience_id;
  try {
    const stats = await CommunicationLog.getStatistics(audience_id);

    res.render("campaignPage", {
      audience_id,
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const showLogList = async (req, res) => {
  try {
    const logs = await CommunicationLog.getAll();
    res.render("communication/communicationLogList", { logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const showLogDetail = async (req, res) => {
  try {
    const log = await CommunicationLog.getById(req.params.id);
    res.render("communication/communicationLogDetail", { log });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  sendMessage,
  updateDeliveryStatus,
  showCampaignPage,
  showLogList,
  showLogDetail,
};
