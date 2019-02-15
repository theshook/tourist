const express = require("express");
const router = express.Router();
const tourController = require("../../controllers/Client/Tour");

// Handle incoming GET requests to /beach
router.get("/", tourController.tour);

router.get("/details", tourController.details);

// Fetch
router.post("/details/1/:attraction1", tourController.fetch_selected1);
router.post("/details/2/:attraction2", tourController.fetch_selected2);
router.post("/details/3/:attraction3", tourController.fetch_selected3);

module.exports = router;