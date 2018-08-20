const express = require("express");
const router = express.Router();
const waterfallController = require("../../controllers/Client/Waterfall");

// Handle incoming GET requests to /waterfall
router.get("/", waterfallController.get_all_Waterfall);

module.exports = router;
