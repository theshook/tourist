const express = require("express");
const router = express.Router();
const beachController = require("../../controllers/Client/Beach");

// Handle incoming GET requests to /beach
router.get("/", beachController.get_all_Beach);
router.get("/:beach_id", beachController.Beach_View);

module.exports = router;
