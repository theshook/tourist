const mysql = require("mysql");

// let connection = mysql.createConnection({
//   host: "bstech-solutions.com",
//   user: "bdvelasc_tourist",
//   password: "tourist",
//   database: "bdvelasc_tourist"
// });

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tourist"
});

module.exports = connection;
