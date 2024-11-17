const express = require("express");
const router = express.Router();
const DataController = require("../controllers/dataController");
const { body, validationResult } = require("express-validator");

router.get("/layout", (req, res) => {
  res.render("Data/layout");
});

router.get("/customers", DataController.renderCustomers);
router.get("/customers/add", DataController.renderAddCustomerForm);
router.post("/customers", DataController.addCustomer);

router.get("/orders", DataController.renderOrders);
router.get("/orders/add", DataController.renderAddOrderForm);
router.post("/orders", DataController.addOrder);

module.exports = router;
