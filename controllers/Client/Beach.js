const db = require("../../db.js");

exports.get_all_Beach = (req, res) => {
  db.query(
    `SELECT spots_category.sc_name, 
    spot_no,
    spot_name,
    spot_subname,
    spot_description, 
    towns.town_name,
    barangays.bar_name
    FROM spots 
    INNER JOIN towns ON spots.town_no = towns.town_no 
    INNER JOIN barangays ON spots.bar_no = barangays.bar_no 
    INNER JOIN spots_category ON spots.sc_no = spots_category.sc_no 
    WHERE spots.sc_no=1 AND (spot_delete=0 AND spot_inactive=0)
    order by spot_no ASC`,
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/Beach", {
        rows: rows,
        pageTitle: "Beaches in Abra"
      });
    }
  );
};
