const express               = require('express');
const router                = express.Router();
const barangayController    = require('../controllers/Barangays');
const isLoggedIn            = require('../isLoggedIn');

// Handle incoming GET requests to /barangay
router.get('/', isLoggedIn, barangayController.barangays_get_all);
router.get('/new', isLoggedIn, barangayController.barangays_new);
router.post('/', isLoggedIn, barangayController.barangays_create);
router.get('/:barId', isLoggedIn, barangayController.barangays_edit);
router.post('/:barId', isLoggedIn, barangayController.barangays_update)
router.post('/delete/:barId', isLoggedIn, barangayController.barangays_delete);

module.exports = router;