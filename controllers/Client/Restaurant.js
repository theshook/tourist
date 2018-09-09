const db = require("../../db.js");
let {
  estab_get_all_query,
  estab_get_single,
  comment_query
} = require("./Helpers/QueryHelpers");

exports.get_all_Restaurant = (req, res) => {
  db.query(estab_get_all_query(1), (err, rows) => {
    if (err) {
      throw err;
    }
    res.render("Client/Restaurant", {
      rows: rows,
      pageTitle: "Restaurants in Abra",
      route: "restaurant"
    });
  });
};

exports.restaurant_View = (req, res) => {
  let id = req.params.restaurant_id;
  db.query(estab_get_single(id), (err, rows) => {
    if (err) {
      throw err;
    }
    res.render("Client/Restaurant/view", {
      rows: rows,
      pageTitle: "Restaurant Information",
      route: "restaurant"
    });
  });
};

exports.comment = (req, res) => {
  let data = {
    estab_no: req.params.restaurant_id,
    spot_id: "",
    user_id: req.user == undefined ? "" : req.user.user_no,
    guest: "",
    content: "Hard coded comment",
    email: ""
  };
  console.log(data);
};
