const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");

const dataRoutes = require("./routes/dataRoutes");
const audienceRoutes = require("./routes/audienceRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const communicationRoutes = require("./routes/communicationRoutes");
dotenv.config();
require("./auth/google");

const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

app.get("/", ensureAuthenticated, (req, res) => {
  res.render("menu");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

app.use("/Data", dataRoutes);
app.use("/audience", audienceRoutes);
app.use("/campaign", campaignRoutes);
app.use("/communication", communicationRoutes);

const Customer = require("./models/customer");
const Order = require("./models/order");
const Audience = require("./models/audience");
const Campaign = require("./models/campaign");
const CommunicationLog = require("./models/communicationLog");

async function initializeTables() {
  await Customer.initialize();
  await Order.initialize();
  await Audience.initialize();
  await Campaign.initialize();
  await CommunicationLog.initialize();
}

initializeTables()
  .then(() => {
    console.log("All tables are initialized");
  })
  .catch((err) => {
    console.error("Error initializing tables:", err);
  });

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
