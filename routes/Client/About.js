const express = require("express");
const router = express.Router();
const aboutController = require("../../controllers/Client/About");

// Handle incoming GET requests to /beach
router.get("/", aboutController.about_us);

module.exports = router;