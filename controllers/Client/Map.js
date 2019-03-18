const db = require("../../db.js");

const { estab_maps } = require('./Helpers/QueryHelpers');

exports.map = (req, res) => {
  let userDetail = req.user || '';

  db.query(`SELECT ec_name FROM establistments_category
  UNION SELECT sc_name FROM spots_category`, (err, rows) => {
      if (err) { throw err; }

      db.query(estab_maps(),
        (err, estab) => {
          if (err) throw err;
          res.render("Client/Map", {
            rows,
            pageTitle: "Map",
            route: "map",
            userDetail: userDetail,
            estab
          });
        });

    });

};