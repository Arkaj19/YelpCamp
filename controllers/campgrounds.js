const Ground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const campgrounds = await Ground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/createcamp");
};

module.exports.postCampground = async (req, res, next) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );
  const new_camp = new Ground(req.body.campground);
  new_camp.geometry = geoData.features[0].geometry;

  new_camp.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  new_camp.author = req.user._id;
  await new_camp.save();
  // console.log(new_camp)
  req.flash("success", "Adventure awaits! Your new campground is live.");
  res.redirect(`/campgrounds/${new_camp.id}`);
};

module.exports.camp_details = async (req, res) => {
  const { id } = req.params;
  const cground = await Ground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  // console.log(cground);
  if (!cground) {
    req.flash(
      "error",
      "OOPS!! Cannot found the campground you are looking for"
    );
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/details", { cground });
};

module.exports.renderUpdateForm = async (req, res) => {
  const { id } = req.params;
  const found = await Ground.findById(id);
  if (!found) {
    req.flash("error", "OOPS!! Cannot found the campground you want to edit");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/update", { found });
};

module.exports.postUpdatedCamp = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const updatedcamp = await Ground.findByIdAndUpdate(id, req.body.campground, {
    runValidators: true,
    new: true,
  });
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );
  updatedcamp.geometry = geoData.features[0].geometry;
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  updatedcamp.images.push(...imgs);
  await updatedcamp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await updatedcamp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(updatedcamp);
  }
  req.flash(
    "success",
    "Changes saved! Your campground is looking better than ever"
  );
  res.redirect(`/campgrounds/${updatedcamp._id}`);
};

module.exports.deleteCamp = async (req, res) => {
  const { id } = req.params;
  const deletedcamp = await Ground.findByIdAndDelete(id);
  req.flash(
    "success",
    "Campground has been taken down. Farewell to that location!"
  );
  res.redirect("/campgrounds");
};
