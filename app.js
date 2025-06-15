if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsmate = require("ejs-mate");
const Ground = require("./models/campground");
const methodoverride = require("method-override");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressErrors");
const { title } = require("process");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const campgroundsRoutes = require("./routes/campgroundRoutes.js");
const reviewsRoutes = require("./routes/reviewsRoutes.js");
const usersRoutes = require("./routes/userRoutes.js");
const MongoStore = require("connect-mongo");

app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "public")));

const dbURI = process.env.DB_URL;

mongoose
  .connect(dbURI, {})
  .then(() => {
    console.log("🥳 Connected to MongoDB ✅");
    // Start your server or other application logic here
  })
  .catch((err) => {
    console.error(" 😭Error connecting to MongoDB ❌:", err);
  });

const store = MongoStore.create({
  mongoUrl: dbURI,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SESSION_SECRET || "fallbackSecret",
  },
});

store.on("error", function (e) {
  console.log("Session Store Error", e);
});

const sessionConfig = {
  store,
  name: "hori",
  secret: process.env.SECRET || "fallbac",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
  // "https://api.mapbox.com/",
  // "https://a.tiles.mapbox.com/",
  // "https://b.tiles.mapbox.com/",
  // "https://events.mapbox.com/",
  "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dams0r5uk/",
        "https://images.unsplash.com/",
        "https://api.maptiler.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.use(mongoSanitize());

app.use((req, res, next) => {
  // console.log(req.query)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", usersRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// *****************Start of index page router *********************//

app.get("/fakeUser", async (req, res) => {
  const user1 = new User({
    email: "archies@gmail.com",
    username: "Archies",
  });
  const newUser = await User.register(user1, "archiespass");
  res.send(newUser);
});

app.all("*", (req, res, next) => {
  // res.send(" 🥺 404!!! Not found")
  next(new ExpressError("Page NOT found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) {
    err.message = "🥺🥺OH, No Something went wrong!!";
  }
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log(" 🥳 Yelpcamp Started 🥳 ");
});
