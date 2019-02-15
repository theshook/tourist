const express           = require('express');
const router            = express.Router();
const clientRegisterController    = require('../../controllers/Client/RegisterClient');

// Handle incoming GET requests to /town
router.get('/', clientRegisterController.register_page);
router.post('/', clientRegisterController.users_create_client);

module.exports = router;