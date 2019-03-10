const express = require("express");
const session = require("express-session");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
let favicon = require("serve-favicon");
let path = require("path");
let flash = require("connect-flash");

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
app.use(bodyParser.json());
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
const featuredRoutes = require("./routes/Featured");
const notificationsRoutes = require("./routes/Notification");

const homeRoutes = require("./routes/Client/Home");

const restaurantRoutes = require("./routes/Client/Restaurant");
const hotelRoutes = require("./routes/Client/Hotel");
const pasalubongRoutes = require("./routes/Client/Pasalubong");
const transportationRoutes = require("./routes/Client/Transportation");
const banksRoutes = require("./routes/Client/Banks");
const churchRoutes = require("./routes/Client/Church");

const festivalRoutes = require("./routes/Client/Festival");
const natureRoutes = require("./routes/Client/Nature");
const ilocanoRoutes = require("./routes/Client/Ilocano");

const clientRegisterRoutes = require("./routes/Client/RegisterClient");
const clientLoginRoutes = require("./routes/Client/LoginClient");

const clientResetPassword = require("./routes/Client/ResetPassword");

const logOut = require("./routes/Logout");

const aboutUs = require("./routes/Client/About");
const map = require("./routes/Client/Map");
const tour = require("./routes/Client/Tour");

const adventureRoutes = require("./routes/Client/Adventure");

app.use("/admin/login", authenticateRoutes);
app.use("/admin/", dashboardRouters);
app.use("/admin/user", userRoutes);
app.use("/admin/town", townRoutes);
app.use("/admin/barangay", barangayRoutes);
app.use("/admin/es-category", categoriesRoutes);
app.use("/admin/establishment", establishmentRoutes);
app.use("/admin/spot", spotRoutes);
app.use("/admin/featured", featuredRoutes);
app.use("/admin/notifications", notificationsRoutes);

app.use("/", homeRoutes);

app.use("/restaurants", restaurantRoutes);
app.use("/hotels", hotelRoutes);
app.use("/pasalubong", pasalubongRoutes);
app.use("/transportation", transportationRoutes);
app.use("/banks", banksRoutes);
app.use("/church", churchRoutes);

app.use("/festival", festivalRoutes);
app.use("/ilocano", ilocanoRoutes);
app.use("/nature", natureRoutes);

app.use("/register", clientRegisterRoutes);
app.use("/login", clientLoginRoutes);
app.use("/reset", clientResetPassword);
app.use("/logout", logOut);

app.use("/about", aboutUs);
app.use("/map", map);
app.use("/tour", tour);

app.use("/adventure", adventureRoutes);

// const port = process.env.PORT || 8001;

// app.listen(port, function(){
//   console.log(`Server is running on ${port}`)
// });

module.exports = app;
