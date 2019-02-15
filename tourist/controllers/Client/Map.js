const db = require("../../db.js");

const { estab_maps } = require('./Helpers/QueryHelpers');

exports.map = (req, res) => {
  let userDetail = req.user || '';
  db.query(estab_maps(),
    (err, estab) => {
      if (err) throw err;
      res.render("Client/Map", {
        pageTitle: "Map",
        route: "map",
        userDetail: userDetail,
        estab
      });
    }
  );
};