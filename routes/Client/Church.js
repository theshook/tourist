const express = require("express");
const router = express.Router();
const churchController = require("../../controllers/Client/Church");

// Handle incoming GET requests to /church
router.get("/", churchController.get_all_Church);

module.exports = router;
