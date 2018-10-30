const express = require("express");
const session = require("express-session");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
let favicon = require("serve-favicon");
let path = require("path");
let flash=require("connect-flash");

// Favicon ==================================================================
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
// ==========================================================================

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

app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


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
const caveRoutes = require("./routes/Client/Cave");

const clientRegisterRoutes = require("./routes/Client/RegisterClient");
const clientLoginRoutes = require("./routes/Client/LoginClient");

const logOut = require("./routes/Logout");

const aboutUs = require("./routes/Client/About");
const map = require("./routes/Client/Map");
const tour = require("./routes/Client/Tour");

app.use("/admin/login", authenticateRoutes);
app.use("/admin/", dashboardRouters);
app.use("/admin/user", userRoutes);
app.use("/admin/town", townRoutes);
app.use("/admin/barangay", barangayRoutes);
app.use("/admin/es-category", categoriesRoutes);
app.use("/admin/establishment", establishmentRoutes);
app.use("/admin/spot", spotRoutes);

app.use("/", homeRoutes);
app.use("/Restaurants", restaurantRoutes);
app.use("/Mountain", islandRoutes);
app.use("/Hotels", hotelRoutes);
app.use("/Pasalubong", churchRoutes);
app.use("/River", beachRoutes);
app.use("/Waterfalls", waterfallRoutes);
app.use("/Cave", caveRoutes);

app.use("/register", clientRegisterRoutes);
app.use("/login", clientLoginRoutes);
app.use("/logout", logOut);

app.use("/about", aboutUs);
app.use("/map", map);
app.use("/tour", tour);

// const port = process.env.PORT || 8001;

// app.listen(port, function(){
//   console.log(`Server is running on ${port}`)
// });

module.exports = app;
