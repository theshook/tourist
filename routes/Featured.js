const express = require("express");
const router = express.Router();
const spotController = require("../controllers/Featured");
const isLoggedIn = require("../isLoggedIn");

router.get("/", isLoggedIn, spotController.spots_gets_all);
router.get("/:spot_no/feature/:sc_name", isLoggedIn, spotController.delete_featured)

module.exports = router;