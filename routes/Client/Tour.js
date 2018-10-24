const express = require("express");
const router = express.Router();
const tourController = require("../../controllers/Client/Tour");

// Handle incoming GET requests to /beach
router.get("/", tourController.tour);

module.exports = router;