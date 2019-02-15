const express = require("express");
const router = express.Router();
const waterfallController = require("../../controllers/Client/Waterfall");

// Handle incoming GET requests to /waterfall
router.get("/", waterfallController.get_all_Waterfall);
router.get("/:waterfall_id", waterfallController.Waterfall_View);
router.post("/:waterfall_id", waterfallController.spot_comments);
router.post("/:waterfall_id/ratings", waterfallController.spot_ratings);

module.exports = router;
