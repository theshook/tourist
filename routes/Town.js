const express           = require('express');
const router            = express.Router();
const townsController   = require('../controllers/Towns');

// Handle incoming GET requests to /town
router.get('/', townsController.towns_get_all);

router.post('/', townsController.towns_create);

router.get('/new', townsController.towns_new);

router.get('/:townId', townsController.towns_edit);

router.post('/:townId', townsController.towns_update)

router.post('/delete/:townId', townsController.towns_delete);

module.exports = router;