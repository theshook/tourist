const db = require("../../db.js");

exports.get_all_Church = (req, res) => {
  db.query(
    `SELECT 
    establistments.estab_no,
    estab_name,
    estab_description,
    towns.town_name,
    establistments_photo.image_filename
    FROM establistments 
    INNER JOIN towns ON establistments.town_no = towns.town_no 
    INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no 
    INNER JOIN establistments_photo ON establistments.estab_no = establistments_photo.estab_no
    WHERE (encode_delete=0 AND encode_inactive=0) AND establistments.ec_no=3 AND establistments_photo.image_isprimary=1
    order by estab_no ASC`,
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/Church", {
        rows: rows,
        pageTitle: "Churches in Abra"
      });
    }
  );
};

exports.church_View = (req, res) => {
  let id = req.params.church_id;
  db.query(`SELECT 
  estab_name,
  estab_description,
  estab_address, 
  towns.town_name,
  barangays.bar_name,
  estab_contact,
  estab_email,
  establistments_location.el_latitude,
  establistments_location.el_lontitude,
  establistments_location.el_route,
  establistments_photo.image_filename,
  establistments_photo.image_isprimary
  FROM establistments
  INNER JOIN establistments_photo ON establistments_photo.estab_no = establistments.estab_no
  INNER JOIN establistments_location ON establistments_location.estab_no = establistments.estab_no
  INNER JOIN establistments_category ON establistments_category.ec_no = establistments.ec_no
  INNER JOIN barangays ON barangays.bar_no = establistments.bar_no
  INNER JOIN towns ON towns.town_no = establistments.town_no
  WHERE establistments.estab_no = ?`, [id], (err, rows) => {
      if (err) {
        throw err;
      }
      res.render('Client/Church/view', { rows: rows, pageTitle: 'Church Information' });
    });
};
