const db = require("../db.js");

exports.spots_gets_all = (req, res) => {
  db.query(`SELECT 
  spots.spot_no,
  spot_name,
  sc_name,
  spot_description, 
  towns.town_name,
  barangays.bar_name
  FROM featured
  INNER JOIN spots ON featured.spot_no = spots.spot_no
  INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
  INNER JOIN barangays ON barangays.bar_no = spots.bar_no
  INNER JOIN towns ON towns.town_no = spots.town_no
  WHERE spots.spot_no = featured.spot_no
  
UNION

SELECT 
  establistments.estab_no, 
  estab_name,
  ec_name,
  estab_description, 
  towns.town_name,
  barangays.bar_name
  FROM featured
  INNER JOIN establistments ON featured.estab_no = establistments.estab_no
  INNER JOIN establistments_category ON establistments_category.ec_no = establistments.ec_no
  INNER JOIN barangays ON barangays.bar_no = establistments.bar_no
  INNER JOIN towns ON towns.town_no = establistments.town_no
  WHERE establistments.estab_no = featured.estab_no`, (err, rows) => {
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
  let category = req.params.sc_name;

  if (category == 'Festival' || category == 'Nature' || category == 'ilocano') {
    db.query(
      `DELETE FROM featured WHERE spot_no = ?`,
      [data],
      (err, rows) => {
        if (err) { throw err; }
        res.redirect("/admin/featured");
      });
  } else {
    db.query(
      `DELETE FROM featured WHERE estab_no = ?`,
      [data],
      (err, rows) => {
        if (err) { throw err; }
        res.redirect("/admin/featured");
      });
  }


}