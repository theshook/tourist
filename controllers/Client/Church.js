const db = require("../../db.js");
let {
  estab_get_all_query,
  estab_get_single
} = require("./Helpers/QueryHelpers");

exports.get_all_Church = (req, res) => {
  db.query(estab_get_all_query(3), (err, rows) => {
    if (err) {
      throw err;
    }
    res.render("Client/Church", {
      rows: rows,
      pageTitle: "Churches in Abra",
      route: "church"
    });
  });
};

exports.church_View = (req, res) => {
  let id = req.params.church_id;
  db.query(estab_get_single(id), (err, rows) => {
    if (err) {
      throw err;
    }
    res.render("Client/Church/view", {
      rows: rows,
      pageTitle: "Church Information",
      route: "church"
    });
  });
};
