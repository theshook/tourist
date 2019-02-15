const express = require("express");
const router = express.Router();
const mapController = require("../../controllers/Client/Map");

// Handle incoming GET requests to /beach
router.get("/", mapController.map);

module.exports = router;