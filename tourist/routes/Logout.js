const express               = require('express');
const router                = express.Router();

// Handle incoming GET requests to /barangay
router.get('/', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;