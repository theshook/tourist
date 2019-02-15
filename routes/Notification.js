const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/Notifications");
const isLoggedIn = require("../isLoggedIn");

router.get("/", isLoggedIn, notificationController.notifs);

module.exports = router;