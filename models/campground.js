const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema; // Necessary to acces the schema constructor in mongoose

const imageSchema = new Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const CampSchema = new Schema(
  {
    title: String,
    images: [imageSchema],
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
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

CampSchema.virtual("properties.popUpMarkUp").get(function () {
  return `<strong><a href= "/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`;
});

CampSchema.post("findOneAndDelete", async function (camp) {
  if (camp) {
    // check if the camp is actually being deleted
    // Consolling the camp we are going to delete
    console.log(camp);

    // Delete all reviews where the `_id` is in the `reviews` array of the deleted campground
    await Review.deleteMany({ _id: { $in: camp.reviews } });

    console.log(`All associated reviews of :  ${camp.title} is deleted`);
  }
});

module.exports = mongoose.model("Campground", CampSchema);
