const express = require("express");
const router = express.Router();
const adventureController = require("../../controllers/Client/Adventure");

// Handle incoming GET requests to /church
router.get("/:adventure", adventureController.get_adventure_category);

module.exports = router;
