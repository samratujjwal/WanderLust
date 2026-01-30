const Listing = require("../models/listing.js");
const maptilerClient = require("@maptiler/client");
const mapToken = process.env.MAP_TOKEN;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

maptilerClient.config.fetch = fetch;

maptilerClient.config.apiKey = mapToken;
module.exports.index = async (req, res) => {
  let allListing = await Listing.find({});
  res.render("./listings/index.ejs", { allListing });
};

module.exports.searchListings = async (req, res) => {
  const { q } = req.query;

  let allListing = [];

  if (!q || q.trim() === "") {
    return res.redirect("/listings");
  }

  allListing = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
    ],
  });

  res.render("./listings/index.ejs", {
    allListing,
    searchQuery: q,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "The Listing You Requested for does not exist !");
    return res.redirect("/listings");
  }

  res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  const result = await maptilerClient.geocoding.forward(
    req.body.listing.location,
  );
  let url = req.file.path;
  let filename = req.file.filename;
  let newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };
  newlisting.geometry = {
    type: "Point",
    coordinates: result.features[0].center,
  };
  newlisting.category = req.body.listing.category;
  let savedListing = await newlisting.save();
  console.log(savedListing);
  req.flash("success", "New Listing Added");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "The Listing You Requested for does not exist !");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    //let {category}=req.body;
    listing.image = { url, filename };
    listing.category = req.body.listing.category;
    await listing.save();
  }
  req.flash("success", "Listing Updated !");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted !");
  res.redirect("/listings");
};
module.exports.renderCategory = async (req, res) => {
  let { category } = req.params;
  let allListing = await Listing.find({ category: category });
  res.render("./listings/showCategory", { allListing, category });
};
