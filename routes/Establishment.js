const express = require('express');
const router = express.Router();
const establishmentController = require('../controllers/Establishments');
const isLoggedIn = require('../isLoggedIn');
let multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});

const fileFiler = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    // Accept a file
    cb(null, true);
  } else {
    // Reject a file
    cb(null, false);
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20 // It could accept 20 megabytes
  },
  fileFiler: fileFiler
});


// Handle incoming GET requests to /Establishment
//Get Single Information
router.get('/view/:estab_no', isLoggedIn, establishmentController.esatablishment_view);

// Get All
router.get('/', isLoggedIn, establishmentController.establishments_gets_all);

// Add new Establishments
router.get('/new', isLoggedIn, establishmentController.esatablishment_new);
router.post('/', isLoggedIn, establishmentController.establishments_create);

// Image
router.get('/image/:estab_no', isLoggedIn, establishmentController.establishments_set_image);
router.post('/image/:estab_no', isLoggedIn, upload.array('image[]', 5), establishmentController.establishments_save_image);

// Location
router.get('/location/:estab_no', isLoggedIn, establishmentController.establishments_set_location)
router.post('/location/:estab_no', isLoggedIn, establishmentController.establishments_save_location)

// Edit
router.get('/:estab_no', isLoggedIn, establishmentController.establishments_edit);

// Update
router.post('/:estab_no', isLoggedIn, establishmentController.establishments_update);

// Delete
router.post('/delete/:estab_no', isLoggedIn, establishmentController.establishment_delete)

router.get("/:estab_no/feature", isLoggedIn, establishmentController.add_featured)

module.exports = router;