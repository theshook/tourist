const express                     = require('express');
const router                      = express.Router();
const ES_CategoriesController     = require('../controllers/ES_Categories');
const isLoggedIn                  = require('../isLoggedIn');

// Handle incoming GET requests to /barangay
router.get('/', isLoggedIn, ES_CategoriesController.categories_get_all);
router.get('/establishment/new', isLoggedIn, ES_CategoriesController.establishments_new);
router.post('/establishment/', isLoggedIn, ES_CategoriesController.establishments_create);

module.exports = router;