const db = require("../../db.js");

exports.get_adventure_category = (req, res) => {
  let adventure = req.params.adventure;
  let advCategory = findAdventureRoute(adventure);

  let userDetail = req.user || '';
  db.query(`SELECT spots.spot_no, spot_name, spot_description, sc_name, img_filename 
  FROM spots_actualuse
  INNER JOIN spots ON spots.sa_no = spots_actualuse.sa_no
  INNER JOIN spots_category ON spots.sc_no = spots_category.sc_no
  INNER JOIN spots_photo ON spots.spot_no = spots_photo.spot_no
  WHERE sa_name = ? AND img_isprimary = 1;`, [advCategory], (err, rows) => {
      if (err) { throw err; }
      res.render("Client/Adventure", {
        pageTitle: advCategory,
        rows,
        userDetail: userDetail
      });
    });
};

findAdventureRoute = (adventure) => {
  let categories = {
    "Water Adventure": "Water-Adventure",
    "Mountain Hiking": "Mountain-Hiking",
    "Cultural Tourism": "Cultural-Tourism",
    "Eco-Tourism": "Eco-Tourism",
    "Mountain Biking": "Mountain-Biking",
    "Caving": "Caving"
  };

  for (let key in categories) {
    if (adventure == categories[key]) {
      return key;
    }
  }
}