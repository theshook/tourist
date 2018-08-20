const express = require("express");
const router = express.Router();
const hotelController = require("../../controllers/Client/Hotel");

// Handle incoming GET requests to /restaurant
router.get("/", hotelController.get_all_Hotel);

module.exports = router;
