const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    filename: { type: String, default: "Deafult" },
    url: {
      type: String,
      default:
        "https://tse4.mm.bing.net/th/id/OIP.tYYh4cqQ3OGHjLEuaaMoXAHaEx?cb=iwc2&rs=1&pid=ImgDetMain",
      set: (v) =>
        v === ""
          ? "https://tse4.mm.bing.net/th/id/OIP.tYYh4cqQ3OGHjLEuaaMoXAHaEx?cb=iwc2&rs=1&pid=ImgDetMain"
          : v,
    },
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  category: {
    type: String,
    enum: [
      "Beach",
      "Mountain",
      "City",
      "Village",
      "Historical",
      "Camping",
      "Luxury",
      "Budget",
      "Iconic Cities",
      "Rooms",
      "Farm",
      "Castles",
    ],
    required: true,
  },
});

listingSchema.index({
  title: "text",
  location: "text",
  country: "text",
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
