const express = require("express");
const router = express.Router();
const islandController = require("../../controllers/Client/Island");

// Handle incoming GET requests to /island
router.get("/", islandController.get_all_island);
router.get("/:island_id", islandController.island_View);
router.post("/:island_id", islandController.spot_comments);
router.post("/:island_id/ratings", islandController.spot_ratings);

module.exports = router;
