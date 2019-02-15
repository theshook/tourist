const db = require("../db.js");

exports.spots_gets_all = (req, res) => {
  db.query(`SELECT 
    spots.spot_no,
    spot_name,
    spot_subname,
    spot_description, 
    towns.town_name,
    barangays.bar_name
    FROM featured
    INNER JOIN spots ON featured.spot_no = spots.spot_no
    INNER JOIN barangays ON barangays.bar_no = spots.bar_no
    INNER JOIN towns ON towns.town_no = spots.town_no
    WHERE spots.spot_no = featured.spot_no`, (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Admin/template", {
        user: req.user,
        rows: rows,
        pageTitle: "Featured Panel",
        page: "featured"
      });
    }
  );
};

exports.delete_featured = (req, res) => {
  let data = req.params.spot_no;
  db.query(
    `DELETE FROM featured WHERE spot_no = ?`,
    [data],
    (err, rows) => {
      if (err) { throw err; }
      res.redirect("/admin/featured");
    }
  );
}