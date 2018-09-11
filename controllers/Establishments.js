const db = require("../db.js");
const moment = require("moment");

exports.esatablishment_view = (req, res) => {
  let id = req.params.estab_no;
  db.query(
    `SELECT 
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
  establistments_photo.image_filename
  FROM establistments
  INNER JOIN establistments_photo ON establistments_photo.estab_no = establistments.estab_no
  INNER JOIN establistments_location ON establistments_location.estab_no = establistments.estab_no
  INNER JOIN establistments_category ON establistments_category.ec_no = establistments.ec_no
  INNER JOIN barangays ON barangays.bar_no = establistments.bar_no
  INNER JOIN towns ON towns.town_no = establistments.town_no
  WHERE establistments.estab_no = ?`,
    [id],
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Admin/template", {
        user: req.user,
        rows: rows,
        pageTitle: "Establishment Panel",
        page: "Establishment/View"
      });
    }
  );
};

exports.establishments_gets_all = (req, res) => {
  let search_towns = req.query.town_q || null;
  let current_page = req.query.page || 1;
  let items_per_page = 4;
  let start_index = (current_page - 1) * items_per_page;

  db.query(
    "SELECT COUNT(*) as total FROM establistments WHERE encode_inactive=0 and      encode_delete=0",
    (err, total_items) => {
      if (err) {
        throw err;
      }

      let total_pages = Math.ceil(total_items[0].total / items_per_page);
      let towns_q = search_towns == null ? null : search_towns;

      let query =
        towns_q == null
          ? `SELECT establistments_category.ec_name, 
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
    WHERE encode_delete=0 AND encode_inactive=0
    order by estab_no ASC
    LIMIT ?, ?`
          : `SELECT establistments_category.ec_name, 
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
    WHERE estab_name=? AND (encode_delete=0 AND encode_inactive=0)
    order by estab_no ASC
    LIMIT ?, ?`;

      let data =
        towns_q == null
          ? [start_index, items_per_page]
          : [towns_q, start_index, items_per_page];

      db.query(query, data, (err, rows) => {
        if (err) {
          throw err;
        }
        res.render("Admin/template", {
          user: req.user,
          total_pages: total_pages,
          rows: rows,
          pageTitle: "Establishment Panel",
          page: "Establishment/establishment"
        });
      });
    }
  );
};

exports.esatablishment_new = (req, res) => {
  db.query(
    "SELECT ec_no, ec_name FROM establistments_category WHERE ec_delete=0 AND ec_inactive=0 order by ec_no",
    (err, rows) => {
      db.query(
        "SELECT town_name, town_no FROM towns WHERE town_inactive=0 AND town_delete=0 ORDER BY town_name ",
        (error, result) => {
          if (error) {
            throw err;
          }
          res.render("Admin/template", {
            user: req.user,
            data: rows,
            towns: result,
            pageTitle: "Establishment Panel",
            page: "Establishment/New"
          });
        }
      );
      if (err) {
        throw err;
      }
    }
  );
};

exports.establishments_create = (req, res) => {
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let data = req.body;
  let user = req.user.user_no;
  db.query(
    "INSERT INTO establistments (ec_no, town_no, bar_no, estab_name, estab_description, estab_address, estab_contact, estab_email, estab_encode, estab_encode_date) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.ec_no,
      data.town_no,
      data.bar_no,
      data.estab_name,
      data.desc,
      data.address,
      data.contact,
      data.email,
      user,
      date
    ],
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.redirect("/admin/establishment");
    }
  );
};

exports.establishments_set_image = (req, res) => {
  let id = req.params.estab_no;
  db.query(
    "SELECT * FROM establistments WHERE estab_no = ? order by estab_no ASC",
    [id],
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Admin/template", {
        user: req.user,
        row: rows,
        pageTitle: "Establishment Panel",
        page: "Establishment/Image"
      });
    }
  );
};

exports.establishments_save_image = (req, res, next) => {
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  let id = req.params.estab_no;
  let images = req.files;
  let count = 1;
  let isPrimary;

  db.query(
    "SELECT * FROM establistments_photo WHERE estab_no = ?",
    [id],
    (err, row) => {
      if (err) {
        throw err;
      } else if (row.length >= 1) {
        db.query(
          "DELETE FROM establistments_photo WHERE estab_no=?",
          [id],
          (err, rows) => {
            if (err) {
              throw err;
            }
            for (let i of images) {
              isPrimary = count == req.body.customRadio ? 1 : 0;

              db.query(
                "INSERT INTO establistments_photo (estab_no, image_filename, image_filenameRaw, image_path, image_fullPath, image_size, image_type, image_encode, image_encode_date, image_isprimary) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
        );
      } else if (row.length == 0) {
        for (let i of images) {
          isPrimary = count == req.body.customRadio ? 1 : 0;

          db.query(
            "INSERT INTO establistments_photo (estab_no, image_filename, image_filenameRaw, image_path, image_fullPath, image_size, image_type, image_encode, image_encode_date, image_isprimary) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      res.redirect("/admin/establishment");
    }
  );
};

exports.establishments_set_location = (req, res) => {
  let id = req.params.estab_no;
  db.query(
    "SELECT * FROM establistments WHERE estab_no = ? order by estab_no ASC",
    [id],
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Admin/template", {
        user: req.user,
        row: rows,
        pageTitle: "Establishment Panel",
        page: "Establishment/Location"
      });
    }
  );
};

exports.establishments_save_location = (req, res, next) => {
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  let id = req.params.estab_no;
  let data = req.body;

  db.query(
    "SELECT * FROM establistments_location WHERE estab_no = ?",
    [id],
    (err, row) => {
      if (err) {
        throw err;
      } else if (row.length >= 1) {
        db.query(
          "UPDATE establistments_location SET el_latitude=?, el_lontitude=?, el_route=?, el_encode=?, el_encode_date=? WHERE el_no=? and estab_no=?",
          [
            data.el_latitude,
            data.el_longitude,
            data.route,
            user,
            date,
            row[0].el_no,
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
          "INSERT INTO establistments_location (estab_no, el_latitude, el_lontitude, el_route, el_encode, el_encode_date) values (?, ?, ?, ?, ?, ?)",
          [id, data.el_latitude, data.el_longitude, data.route, user, date],
          (err, rows) => {
            if (err) {
              throw err;
            }
          }
        );
      }
      res.redirect("/admin/establishment");
    }
  );
};

exports.establishments_edit = (req, res) => {
  let id = req.params.estab_no;
  db.query(
    "SELECT ec_no, ec_name FROM establistments_category order by ec_no",
    (err, rows) => {
      db.query(
        "SELECT towns.town_no, towns.town_name, barangays.bar_name, barangays.bar_no FROM towns INNER JOIN barangays ON towns.town_no = barangays.bar_no order by town_no",
        (error, result) => {
          db.query(
            "SELECT * FROM establistments WHERE estab_no = ?",
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
                pageTitle: "Establishment Panel",
                page: "Establishment/Update"
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

exports.establishments_update = (req, res) => {
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  let id = req.params.estab_no;
  let data = req.body;
  db.query(
    "UPDATE `establistments` SET `ec_no`=?,`town_no`=?,`bar_no`=?,`estab_name`=?,`estab_description`=?,`estab_address`=?,`estab_contact`=?,`estab_email`=?,`estab_encode`=?,`estab_encode_date`=? WHERE estab_no=?",
    [
      data.ec_no,
      data.town_no,
      data.bar_no,
      data.estab_name,
      data.desc,
      data.address,
      data.contact,
      data.email,
      user,
      date,
      id
    ],
    (err, row) => {
      if (err) {
        throw err;
      }
      res.redirect("/admin/establishment");
    }
  );
};

exports.establishment_delete = (req, res) => {
  let date = moment().format("YYYY-MM-DD HH:mm:ss");
  let user = req.user.user_no;
  let id = req.params.estab_no;
  db.query(
    "UPDATE establistments SET encode_delete=1 WHERE estab_no=?",
    [id],
    (err, row) => {
      if (err) {
        throw err;
      }
      db.query(
        "UPDATE establistments_location SET el_delete=1 WHERE estab_no=?",
        [id],
        (err, ro) => {
          if (err) {
            throw err;
          }
          db.query(
            "UPDATE establistments_photo SET image_delete=1 WHERE estab_no=?",
            [id],
            (err, r) => {
              if (err) {
                throw err;
              }
              res.redirect("/admin/establishment");
            }
          );
        }
      );
    }
  );
};
