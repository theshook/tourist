const express = require("express");
const router = express.Router();
const festivalController = require("../../controllers/Client/Nature");

// Handle incoming GET requests to /waterfall
router.get("/", festivalController.get_all_Waterfall);
router.get("/:waterfall_id", festivalController.Waterfall_View);
router.post("/:waterfall_id", festivalController.spot_comments);
router.post("/:waterfall_id/ratings", festivalController.spot_ratings);

module.exports = router;
