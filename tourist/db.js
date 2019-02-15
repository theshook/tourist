const mysql = require("mysql");

let connection = mysql.createPool({
  host: "bstech-solutions.com",
  port: 3306,
  user: "bdvelasc_tourist",
  password: "tourist",
  database: "bdvelasc_tourist"
});


// let connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "tourist"
// });

module.exports = connection;
