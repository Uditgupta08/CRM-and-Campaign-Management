const express = require("express");
const router = express.Router();
const communicationController = require("../controllers/communicationLogController");

router.get("/send", (req, res) => {
  res.render("communication/sendMessage");
});
router.post("/send", communicationController.sendMessage);
router.put("/status/:id", communicationController.updateDeliveryStatus);
router.get("/", communicationController.showLogList);
router.get("/log/:id", communicationController.showLogDetail);

module.exports = router;
