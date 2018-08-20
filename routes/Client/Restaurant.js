const express = require("express");
const router = express.Router();
const restaurantController = require("../../controllers/Client/Restaurant");

// Handle incoming GET requests to /restaurant
router.get("/", restaurantController.get_all_Restaurant);

module.exports = router;
