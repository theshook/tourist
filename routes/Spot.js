const express = require("express");
const router = express.Router();
const spotController = require("../controllers/Spot");
const isLoggedIn = require("../isLoggedIn");
let multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  }
});

const fileFiler = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    // Accept a file
    cb(null, true);
  } else {
    // Reject a file
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20 // It could accept 20 megabytes
  },
  fileFiler: fileFiler
});

// Handle incoming GET requests to /spot
// Get All
router.get("/", isLoggedIn, spotController.spots_gets_all);

// Single View
router.get("/view/:spot_no", isLoggedIn, spotController.spot_view);

// Add new Establishments
router.get("/new", isLoggedIn, spotController.spots_new);
router.post("/new/barangays/:town_no", spotController.spots_barangays);
router.post("/", isLoggedIn, spotController.spots_create);

// Set an Image
router.get("/image/:spot_no", isLoggedIn, spotController.spots_set_image);
router.post(
  "/image/:spot_no",
  isLoggedIn,
  upload.array("image[]", 5),
  spotController.spots_save_image
);

// Set Location
router.get("/location/:spot_no", isLoggedIn, spotController.spots_set_location);
router.post(
  "/location/:spot_no",
  isLoggedIn,
  spotController.spots_save_location
);

// Edit/Update information of Spot
router.get("/:spot_no", isLoggedIn, spotController.spots_edit);
router.post("/:spot_no", isLoggedIn, spotController.spots_update);

module.exports = router;
