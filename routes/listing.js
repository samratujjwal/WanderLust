const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
// MULTER
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// category rout
router.get("/category/:category", wrapAsync(listingController.renderCategory));

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    validateListing,
    upload.single("listing[image][url]"),
    wrapAsync(listingController.createListing),
  );

///////////////////////       NEW ROUTE   //////////////////////
router.get("/new", isLoggedIn, listingController.renderNewForm);
router.get("/search", listingController.searchListings);
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image][url]"),
    wrapAsync(listingController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

/////////////////////   EDIT ROUTE      /////////////////
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

router.get("/search", async (req, res) => {
  const { q } = req.query;

  const listings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
    ],
  });

  res.render("listings/index", { listings, searchQuery: q });
});

module.exports = router;
