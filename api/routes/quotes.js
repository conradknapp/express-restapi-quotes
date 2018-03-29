const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const multer = require("multer");

const QuotesController = require("../controllers/quotes");

// allows you to adjust how files get stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()}${file.originalname}`);
  }
});

// filters out files uploaded that are not .jpg or .png
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Init multer; specifies place where multer will upload files (multer automatically creates it), or can pass storage object (to let us specify more detailed name/destination info on file upload)
const upload = multer({
  storage,
  limits: {
    // stores files only up to 5mb
    fileSize: 1024 * 1024 * 5
  },
  fileFilter
});

// bring in Quote model
const Quote = require("../models/quote");

router.get("/", QuotesController.quotes_get_all);

router.post("/", checkAuth, QuotesController.quotes_create_quote);

router.get("/random", QuotesController.quotes_get_random_quote);

router.get("/:quote_id", QuotesController.quotes_get_quote);

router.patch("/:quote_id", checkAuth, QuotesController.quotes_update_quote);

router.delete("/:quote_id", checkAuth, QuotesController.quotes_delete_quote);

module.exports = router;
