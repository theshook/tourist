const express = require("express");
const router = express.Router();
const islandController = require("../../controllers/Client/Island");

// Handle incoming GET requests to /island
router.get("/", islandController.get_all_Island);

module.exports = router;
