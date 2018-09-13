const express = require("express");
const router = express.Router();
const hotelController = require("../../controllers/Client/Hotel");

// Handle incoming GET requests to /restaurant
router.get("/", hotelController.get_all_Hotel);

router.get("/:hotel_id", hotelController.hotel_View);
router.post("/:hotel_id", hotelController.hotel_comments);

module.exports = router;
