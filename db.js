const mysql = require("mysql");

let connection = mysql.createPool({
  host: "bstech-solutions.com",
  port: 3306,
  user: "bdvelasc_tourist",
  password: "tourist",
  database: "bdvelasc_tourist"
});


// let connection = mysql.createConnection({
//   host: "bstech-solutions.com",
//   port: 3306,
//   user: "bdvelasc_tourist",
//   password: "tourist",
//   database: "bdvelasc_tourist"
// });

module.exports = connection;
