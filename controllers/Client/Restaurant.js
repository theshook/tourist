const db = require("../../db.js");

exports.get_all_Restaurant = (req, res) => {
  db.query(
    `SELECT establistments_category.ec_name, 
  estab_no,
  estab_name,
  estab_description,
  estab_address, 
  towns.town_name,
  barangays.bar_name,
  estab_contact,
  estab_email 
  FROM establistments 
  INNER JOIN towns ON establistments.town_no = towns.town_no 
  INNER JOIN barangays ON establistments.bar_no = barangays.bar_no 
  INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no 
  WHERE (encode_delete=0 AND encode_inactive=0) AND establistments.ec_no=1
  order by estab_no ASC`,
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/Restaurant", {
        rows: rows,
        pageTitle: "Restaurants in Abra"
      });
    }
  );
};
