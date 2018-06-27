const express           = require('express');
const router            = express.Router();
const barangayController   = require('../controllers/Barangays');

// Handle incoming GET requests to /barangay
router.get('/', barangayController.barangays_get_all);
router.get('/new', barangayController.barangays_new);
router.post('/', barangayController.barangays_create);
router.get('/:barId', barangayController.barangays_edit);
router.post('/:barId', barangayController.barangays_update)
router.post('/delete/:barId', barangayController.barangays_delete);

module.exports = router;