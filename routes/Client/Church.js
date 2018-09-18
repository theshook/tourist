const express = require("express");
const router = express.Router();
const churchController = require("../../controllers/Client/Church");

// Handle incoming GET requests to /church
router.get("/", churchController.get_all_Church);

router.get("/:church_id", churchController.church_View);

router.post("/:church_id", churchController.church_comments);

router.post("/:church_id/ratings", churchController.church_ratings);

module.exports = router;
