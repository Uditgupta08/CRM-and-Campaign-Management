const Audience = require("../models/audience");
const Customer = require("../models/customer");
const db = require("../config/db");

const listAudiences = async (req, res) => {
  try {
    const audiences = await Audience.getAll();
    res.render("audience/index", { audiences });
  } catch (error) {
    res.status(500).send("Error fetching audiences");
  }
};

const newAudienceForm = (req, res) => {
  res.render("audience/new");
};

const createAudience = async (req, res) => {
  try {
    const { name, conditions } = req.body;

    const size = await Audience.calculateSize(conditions);
    const audienceId = await Audience.create({ name, conditions, size });
    const matchingCustomers = await db.query(
      `SELECT customer_id FROM customers WHERE total_spending > ?`,
      [conditions[0].value]
    );

    const customerIds = matchingCustomers[0].map((c) => c.customer_id);
    if (customerIds.length > 0) {
      await Audience.addCustomersToAudience(audienceId, customerIds);
    }

    res.redirect(`/audience/${audienceId}`);
  } catch (error) {
    console.error("Error creating audience:", error);
    res.status(500).send("Error creating audience");
  }
};

const calculateAudienceSize = async (req, res) => {
  try {
    const { conditions } = req.body;
    const size = await Audience.calculateSize(conditions);
    res.json({ size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const showAudience = async (req, res) => {
  try {
    const audience = await Audience.getById(req.params.id);
    if (!audience) return res.status(404).send("Audience not found");
    const customers = await Audience.getCustomersById(req.params.id);

    res.render("audience/show", { audience, customers });
  } catch (error) {
    console.error("Error fetching audience details:", error);
    res.status(500).send("Error fetching audience details");
  }
};

module.exports = {
  listAudiences,
  newAudienceForm,
  createAudience,
  showAudience,
  calculateAudienceSize,
};
