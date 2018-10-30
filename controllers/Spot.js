const db = require("../db.js");
var moment = require("moment");

exports.spots_gets_all = (req, res) => {
  let search_towns = req.query.town_q || null;
  let current_page = req.query.page || 1;
  let items_per_page = 4;
  let start_index = (current_page - 1) * items_per_page;

  db.query(
    `SELECT 
    count(*) as total
    FROM spots 
    INNER JOIN towns ON spots.town_no = towns.town_no 
    INNER JOIN barangays ON spots.bar_no = barangays.bar_no 
    INNER JOIN spots_category ON spots.sc_no = spots_category.sc_no 
    WHERE spot_delete=0 AND spot_inactive=0`,
    (err, total_items) => {
      if (err) {
        throw err;
      }

      let total_pages = Math.ceil(total_items[0].total / items_per_page);
      let towns_q = search_towns == null ? null : search_towns;

      let query =
        towns_q == null
          ? `SELECT spots_category.sc_name, 
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
    WHERE spot_delete=0 AND spot_inactive=0
    order by spot_no ASC 
    LIMIT ?, ?`
          : `SELECT spots_category.sc_name, 
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
    WHERE spot_name=? OR spot_subname=? AND (spot_delete=0 AND spot_inactive=0)
    order by spot_no ASC 
    LIMIT ?, ?`;

      let data =
        towns_q == null
          ? [start_index, items_per_page]
          : [towns_q, towns_q, start_index, items_per_page];

      db.query(query, data, (err, rows) => {
        if (err) {
          throw err;
        }
        res.render("Admin/template", {
          user: req.user,
          total_pages: total_pages,
          rows: rows,
          pageTitle: "Spot Panel",
          page: "Spot/Spot"
        });
      });
    }
  );
};

exports.spots_new = (req, res) => {
  let search_towns = req.query.town_no || 3;
  db.query(
    "SELECT sc_no, sc_name FROM spots_category WHERE sc_delete=0 AND sc_inactive=0 order by sc_no",
    (err, rows) => {
      db.query(
        `SELECT town_name, town_no FROM towns WHERE town_inactive=0 AND town_delete=0 ORDER BY town_name `,
        (error, towns) => {
          db.query(
            `SELECT bar_name, bar_no FROM barangays WHERE town_no=${search_towns} AND bar_inactive=0 AND bar_delete=0 ORDER BY bar_name`,
            (errors, bars) => {
              if (errors) {
                throw err;
              }
              res.render("Admin/template", {
                user: req.user,
                data: rows,
                towns: towns,
                bars: bars,
                pageTitle: "Spot Panel",
                page: "Spot/New"
              });
            }
          );
          if (error) {
            throw err;
          }
        }
      );
      if (err) {
        throw err;
      }
    }
  );
};

exports.spots_barangays = (req, res) => {
  let id = req.params.town_no;
  db.query(
    "SELECT bar_name, bar_no FROM barangays WHERE town_no=? AND bar_inactive=0 AND bar_delete=0 ORDER BY bar_name",
    [id],
    (err, result) => {
      if (err) {
        throw err;
      }
      res.send(JSON.stringify(result));
    }
  );
};

exports.spots_create = (req, res) => {
  let data = req.body;
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  db.query(
    "INSERT INTO spots (sc_no, town_no, bar_no, spot_name, spot_subname, spot_description, spot_encode, spot_encode_date) values (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.sc_no,
      data.town_no,
      data.bar_no,
      data.spot_name,
      data.spot_subname,
      data.desc,
      user,
      date
    ],
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.redirect("/admin/spot");
    }
  );
};

exports.spots_set_image = (req, res) => {
  let id = req.params.spot_no;
  db.query(
    "SELECT * FROM spots WHERE spot_no = ? order by spot_no ASC",
    [id],
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Admin/template", {
        user: req.user,
        row: rows,
        pageTitle: "Spot Panel",
        page: "Spot/Image"
      });
    }
  );
};

exports.spots_save_image = (req, res, next) => {
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  let id = req.params.spot_no;
  let images = req.files;
  let count = 1;
  let isPrimary;

  db.query("SELECT * FROM spots_photo WHERE spot_no = ?", [id], (err, row) => {
    if (err) {
      throw err;
    } else if (row.length >= 1) {
      db.query("DELETE FROM spots_photo WHERE spot_no=?", [id], (err, rows) => {
        if (err) {
          throw err;
        }
        for (let i of images) {
          isPrimary = count == req.body.customRadio ? 1 : 0;

          db.query(
            "INSERT INTO spots_photo (spot_no, img_filename, img_filenameRaw, img_path, img_fullPath, img_size, img_type, img_encode, img_encode_date, img_isprimary) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              id,
              i.filename,
              i.originalname,
              i.destination,
              i.path,
              i.size,
              i.mimetype,
              user,
              date,
              isPrimary
            ],
            (err, rows) => {
              if (err) {
                throw err;
              }
            }
          );
          count++;
        }
      });
    } else if (row.length == 0) {
      for (let i of images) {
        isPrimary = count == req.body.customRadio ? 1 : 0;

        db.query(
          "INSERT INTO spots_photo (spot_no, img_filename, img_filenameRaw, img_path, img_fullPath, img_size, img_type, img_encode, img_encode_date, img_isprimary) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            id,
            i.filename,
            i.originalname,
            i.destination,
            i.path,
            i.size,
            i.mimetype,
            user,
            date,
            isPrimary
          ],
          (err, rows) => {
            if (err) {
              throw err;
            }
          }
        );
        count++;
      }
    }
    res.redirect("/admin/spot");
  });
};

exports.spots_set_location = (req, res) => {
  let id = req.params.spot_no;
  db.query(
    "SELECT * FROM spots WHERE spot_no = ? order by spot_no ASC",
    [id],
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Admin/template", {
        user: req.user,
        row: rows,
        pageTitle: "Spot Panel",
        page: "Spot/Location"
      });
    }
  );
};

exports.spots_save_location = (req, res) => {
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  let id = req.params.spot_no;
  let data = req.body;

  db.query(
    "SELECT * FROM spots_location WHERE spot_no = ?",
    [id],
    (err, row) => {
      if (err) {
        throw err;
      } else if (row.length >= 1) {
        db.query(
          "UPDATE spots_location SET sl_latitude=?, sl_lontitude=?, sl_route=?, sl_encode=?, sl_encode_date=? WHERE sl_no=? and spot_no=?",
          [
            data.sl_latitude,
            data.sl_longitude,
            data.sl_route,
            user,
            date,
            row[0].sl_no,
            id
          ],
          (err, rows) => {
            if (err) {
              throw err;
            }
          }
        );
      } else if (row.length == 0) {
        db.query(
          "INSERT INTO spots_location (spot_no, sl_latitude, sl_lontitude, sl_route, sl_encode, sl_encode_date) values (?, ?, ?, ?, ?, ?)",
          [id, data.sl_latitude, data.sl_longitude, data.sl_route, user, date],
          (err, rows) => {
            if (err) {
              throw err;
            }
          }
        );
      }
      res.redirect("/admin/spot");
    }
  );
};

exports.spots_edit = (req, res) => {
  let id = req.params.spot_no;
  db.query(
    "SELECT sc_no, sc_name FROM spots_category order by sc_no",
    (err, rows) => {
      db.query(
        "SELECT towns.town_no, towns.town_name, barangays.bar_name, barangays.bar_no FROM towns INNER JOIN barangays ON towns.town_no = barangays.bar_no order by town_no",
        (error, result) => {
          db.query(
            "SELECT * FROM spots WHERE spot_no = ?",
            [id],
            (err, info) => {
              if (error) {
                throw err;
              }
              res.render("Admin/template", {
                user: req.user,
                info: info,
                data: rows,
                towns: result,
                pageTitle: "Spot Panel",
                page: "Spot/Update"
              });
            }
          );
          if (error) {
            throw err;
          }
        }
      );
      if (err) {
        throw err;
      }
    }
  );
};

exports.spots_update = (req, res) => {
  let user = req.user.user_no;
  let id = req.params.spot_no;
  let data = req.body;
  db.query(
    "UPDATE `spots` SET `sc_no`=?,`town_no`=?,`bar_no`=?,`spot_name`=?,`spot_description`=?, spot_subname=?, `spot_encode`=? WHERE spot_no=?",
    [
      data.sc_no,
      data.town_no,
      data.bar_no,
      data.spot_name,
      data.desc,
      data.spot_subname,
      user,
      id
    ],
    (err, row) => {
      if (err) {
        throw err;
      }
      res.redirect("/admin/spot");
    }
  );
};

// View Single Spot
exports.spot_view = (req, res) => {
  let id = req.params.spot_no;
  db.query(
    `SELECT 
  spot_name,
  spot_subname,
  spot_description, 
  spots_category.sc_name,
  towns.town_name,
  barangays.bar_name,
  spots_location.sl_latitude,
  spots_location.sl_lontitude,
  spots_location.sl_route,
  spots_photo.img_filename
  FROM spots
  INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
  INNER JOIN spots_location ON spots_location.spot_no = spots.spot_no
  INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
  INNER JOIN barangays ON barangays.bar_no = spots.bar_no
  INNER JOIN towns ON towns.town_no = spots.town_no
  WHERE spots.spot_no = ?`,
    [id],
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Admin/template", {
        user: req.user,
        rows: rows,
        pageTitle: "Spot Panel",
        page: "Spot/View"
      });
    }
  );
};
