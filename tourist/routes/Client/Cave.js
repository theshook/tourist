const express = require("express");
const router = express.Router();
const caveController = require("../../controllers/Client/Cave");

// Handle incoming GET requests to /island
router.get("/", caveController.get_all_cave);
router.get("/:cave_id", caveController.cave_View);
router.post("/:cave_id", caveController.spot_comments);
router.post("/:cave_id/cave_id", caveController.spot_ratings);

module.exports = router;
