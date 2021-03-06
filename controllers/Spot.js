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
    order by spot_name ASC 
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
    order by spot_name ASC 
    LIMIT ?, ?`;

      let data =
        towns_q == null
          ? [start_index, items_per_page]
          : [towns_q, towns_q, start_index, items_per_page];

      db.query(query, data, (err, rows) => {
        if (err) { throw err; }

        db.query(`SELECT spot_no from featured`, (sel_err, sel_row) => {
          if (sel_err) { throw sel_err; }

          res.render("Admin/template", {
            user: req.user,
            total_pages: total_pages,
            sel_row,
            rows: rows,
            pageTitle: "Spot Panel",
            page: "Spot/Spot"
          });
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

              db.query(`SELECT sa_no, sa_name FROM spots_actualuse WHERE sa_inactive = 0 and sa_delete = 0`, (actual_errs, actuals) => {
                if (actual_errs) { throw actual_errs; }
                res.render("Admin/template", {
                  user: req.user,
                  actuals,
                  data: rows,
                  towns: towns,
                  bars: bars,
                  pageTitle: "Spot Panel",
                  page: "Spot/New"
                });
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
    "INSERT INTO spots (sa_no, sc_no, town_no, bar_no, spot_name, spot_subname, spot_description, spot_encode, spot_encode_date) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.sa_no,
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
      if (err) { throw err; }
      var str = data.keywords;
      var result = str.split(';');

      for (i = 0; i < result.length; i++) {
        if (result[i] != '') {
          db.query("INSERT INTO keywords (k_spot_no, k_keyword) VALUES(?, ?)",
            [rows.insertId, result[i]], (kerr, krows) => {
              if (kerr) throw kerr;
            });
        }
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

              db.query(`SELECT sa_no, sa_name FROM spots_actualuse WHERE sa_inactive = 0 and sa_delete = 0`, (actual_err, actuals) => {
                if (actual_err) { throw actual_err; }

                db.query("SELECT k_keyword FROM keywords WHERE k_spot_no = ?", [id],
                  (derr, drows) => {
                    if (derr) throw derr;

                    res.render("Admin/template", {
                      user: req.user,
                      info: info,
                      actuals,
                      data: rows,
                      drows,
                      towns: result,
                      pageTitle: "Spot Panel",
                      page: "Spot/Update"
                    });
                  });
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
    "UPDATE `spots` SET `sa_no`=?, `sc_no`=?,`town_no`=?,`bar_no`=?,`spot_name`=?,`spot_description`=?, spot_subname=?, `spot_encode`=? WHERE spot_no=?",
    [
      data.sa_no,
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
      if (err) { throw err; }
      db.query("DELETE FROM keywords WHERE k_spot_no = ?", [id], (derr, drows) => {
        if (derr) throw derr;

        var str = data.keywords;
        var result = str.split(';');

        for (i = 0; i < result.length; i++) {
          if (result[i] != '') {
            db.query("INSERT INTO keywords (k_spot_no, k_keyword) VALUES(?, ?)",
              [id, result[i]], (kerr, krows) => {
                if (kerr) throw kerr;
              });
          }
        }

        res.redirect("/admin/spot");
      });
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
    barangays.bar_name
    FROM spots
    INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
    INNER JOIN barangays ON barangays.bar_no = spots.bar_no
    INNER JOIN towns ON towns.town_no = spots.town_no
    WHERE spots.spot_no = ?`,
    [id], (err, rows) => {
      if (err) { throw err; }

      db.query(`SELECT 
        spots_location.sl_latitude,
        spots_location.sl_lontitude,
        spots_location.sl_route
        FROM spots
        INNER JOIN spots_location ON spots_location.spot_no = spots.spot_no
        WHERE spots.spot_no = ?`,
        [id], (errs, locations) => {
          if (errs) { throw errs; }

          db.query(`SELECT 
          spots_photo.img_filename
          FROM spots
          INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
          WHERE spots.spot_no = ?`,
            [id], (errss, images) => {
              if (errss) { throw errss; }

              res.render("Admin/template", {
                user: req.user,
                rows: rows,
                images,
                sl_latitude: locations.length ? locations[0].sl_latitude : "N/A",
                sl_lontitude: locations.length ? locations[0].sl_lontitude : "N/A",
                sl_route: locations.length ? locations[0].sl_route : "N/A",
                pageTitle: "Spot Panel",
                page: "Spot/View"
              });
            });
        });
    }
  );
};

exports.establishment_delete = (req, res) => {
  let date = moment().format("YYYY-MM-DD HH:mm:ss");
  let user = req.user.user_no;
  let id = req.params.spot_no;
  db.query(
    "DELETE FROM spots WHERE spot_no = ?",
    [id],
    (err, row) => {
      if (err) {
        throw err;
      }
      db.query(
        "DELETE FROM spots_location WHERE spot_no=?",
        [id],
        (err, ro) => {
          if (err) {
            throw err;
          }
          db.query(
            "DELETE FROM spots_photo WHERE spot_no=?",
            [id],
            (err, r) => {
              if (err) {
                throw err;
              }
              res.redirect("/admin/spot");
            }
          );
        }
      );
    }
  );
};

exports.add_featured = (req, res) => {
  let data = req.params.spot_no;
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;

  db.query(`SELECT spot_no FROM featured WHERE spot_no = ?`, [data], (serr, srows) => {

    if (srows.length != 0) {
      res.redirect("/admin/spot");
    } else {
      db.query(`SELECT count(*) AS total FROM featured`, (count_err, count_rows) => {

        if (count_rows[0].total < 5) {
          db.query(
            `INSERT INTO featured 
            (spot_no, featured_encode, featured_encode_date) 
            values (?, ?, ?)`,
            [data, user, date],
            (err, rows) => {
              if (err) { throw err; }
              res.redirect("/admin/spot");
            });
        } else {
          res.redirect("/admin/spot");
        }
      });
    }
  });

}