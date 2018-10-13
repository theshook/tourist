const express = require("express");
const router = express.Router();
const beachController = require("../../controllers/Client/Beach");

// Handle incoming GET requests to /beach
router.get("/", beachController.get_all_beach);
router.get("/:beach_id", beachController.beach_View);
router.post("/:beach_id", beachController.spot_comments);
router.post("/:beach_id/ratings", beachController.spot_ratings);

module.exports = router;
