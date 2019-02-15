const express               = require('express');
const router                = express.Router();
const dashboardController   = require('../controllers/Dashboards');
const isLoggedIn            = require('../isLoggedIn');

// Handle incoming GET requests to /barangay
router.get('/', isLoggedIn, dashboardController.dashboard_get_all);

module.exports = router;