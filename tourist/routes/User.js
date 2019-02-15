const express           = require('express');
const router            = express.Router();
const userController    = require('../controllers/Users');
const isLoggedIn        = require('../isLoggedIn');

// Handle incoming GET requests to /town
router.get('/', isLoggedIn, userController.users_get_all);
router.get('/new', isLoggedIn, userController.users_new);
router.post('/', isLoggedIn, userController.users_create);
router.get('/:userId', isLoggedIn, userController.user_edit);
router.post('/:userId', isLoggedIn, userController.user_update);

module.exports = router;