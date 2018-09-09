const db = require("../../db.js");
let {
  estab_get_all_query,
  estab_get_single
} = require("./Helpers/QueryHelpers");

exports.get_all_Hotel = (req, res) => {
  db.query(estab_get_all_query(2), (err, rows) => {
    if (err) {
      throw err;
    }
    res.render(`Client/Hotel`, {
      rows: rows,
      pageTitle: `Hotel in Abra`,
      route: "hotel"
    });
  });
};

exports.hotel_View = (req, res) => {
  let id = req.params.hotel_id;
  db.query(estab_get_single(id), (err, rows) => {
    if (err) {
      throw err;
    }
    res.render("Client/Hotel/view", {
      rows: rows,
      pageTitle: "Hotel Information",
      route: "hotel"
    });
  });
};
