const express           = require('express');
const router            = express.Router();
const townsController   = require('../controllers/Towns');
const isLoggedIn        = require('../isLoggedIn');

// Handle incoming GET requests to /town
router.get('/', isLoggedIn, townsController.towns_get_all);

router.post('/', isLoggedIn, townsController.towns_create);

router.get('/new', isLoggedIn, townsController.towns_new);

router.get('/edit/:townId', isLoggedIn, townsController.towns_edit);

router.post('/edit/:townId', isLoggedIn, townsController.towns_update)

router.post('/delete/:townId', isLoggedIn, townsController.towns_delete);

module.exports = router;