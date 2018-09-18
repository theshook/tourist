const express = require("express");
const router = express.Router();
const restaurantController = require("../../controllers/Client/Restaurant");

// Handle incoming GET requests to /restaurant
router.get("/", restaurantController.get_all_Restaurant);

router.get("/:restaurant_id", restaurantController.restaurant_View);

router.post("/:restaurant_id", restaurantController.restaurant_comments);

router.post("/:restaurant_id/ratings", restaurantController.restaurant_ratings);


module.exports = router;
