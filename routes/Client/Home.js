const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/Client/Home");

// Handle incoming GET requests to /
router.get("/", homeController.get_all_Category);
router.get("/search", homeController.get_search);
router.get("/api/search", homeController.get_search_api);

module.exports = router;
