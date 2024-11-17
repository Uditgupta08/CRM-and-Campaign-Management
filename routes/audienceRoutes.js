const express = require("express");
const router = express.Router();
const audienceController = require("../controllers/audienceController");

router.post("/", audienceController.createAudience);
router.get("/new", audienceController.newAudienceForm);
router.get("/", audienceController.listAudiences);
router.get("/:id", audienceController.showAudience);
router.post("/calculateSize", audienceController.calculateAudienceSize);

module.exports = router;
