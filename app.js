const express = require("express");
const session = require("express-session");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");

// configuration ==============================================
// connect to our database

require("./passport")(passport); // pass passport for configuration
// required for passport
app.use(
  session({
    secret: "vidyapathaisalwaysrunning",
    resave: true,
    saveUninitialized: true
  })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// const googleMapsClient = require('@google/maps').createClient({
//   key: 'AIzaSyC9v26KPdWkUp9antAALdJ_5cSUjqzUSO0'
// });

// googleMapsClient.geocode({
//   address: '1600 Amphitheatre Parkway, Mountain View, CA'
// }, function(err, response) {
//   if (!err) {
//     console.log(response.json.results);
//   }
// });

const townRoutes = require("./routes/Town");
const barangayRoutes = require("./routes/Barangay");
const authenticateRoutes = require("./routes/Authenticate");
const userRoutes = require("./routes/User");
const dashboardRouters = require("./routes/Dashboard");
const categoriesRoutes = require("./routes/ES_Category");
const establishmentRoutes = require("./routes/Establishment");
const spotRoutes = require("./routes/Spot");

const homeRoutes = require("./routes/Client/Home");
const restaurantRoutes = require("./routes/Client/Restaurant");
const islandRoutes = require("./routes/Client/Island");
const hotelRoutes = require("./routes/Client/Hotel");
const churchRoutes = require("./routes/Client/Church");
const beachRoutes = require("./routes/Client/Beach");
const waterfallRoutes = require("./routes/Client/Waterfall");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/places-to-go", (req, res) => {
  res.render("places-to-go", { pageTitle: "places-to-go" });
});

app.get("/things-to-do", (req, res) => {
  res.render("things-to-do", { pageTitle: "things-to-do" });
});

app.get("/plan-your-trip", (req, res) => {
  res.render("plan-your-trip", { pageTitle: "plan-your-trip" });
});

app.get("/login", (req, res) => {
  res.render("Client/Login/login", { pageTitle: "Login" });
});

app.get("/register", (req, res) => {
  res.render("Client/Register/register", { pageTitle: "Login" });
});

app.use("/admin/login", authenticateRoutes);
app.use("/admin/", dashboardRouters);
app.use("/admin/user", userRoutes);
app.use("/admin/town", townRoutes);
app.use("/admin/barangay", barangayRoutes);
app.use("/admin/es-category", categoriesRoutes);
app.use("/admin/establishment", establishmentRoutes);
app.use("/admin/spot", spotRoutes);

app.use("/", homeRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/island", islandRoutes);
app.use("/hotel", hotelRoutes);
app.use("/church", churchRoutes);
app.use("/beach", beachRoutes);
app.use("/waterfall", waterfallRoutes);

// const port = process.env.PORT || 8001;

// app.listen(port, function(){
//   console.log(`Server is running on ${port}`)
// });

module.exports = app;
