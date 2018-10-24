const db = require("../../db.js");
var moment = require("moment");
const publicIp = require("public-ip");
let {
  estab_get_all_query,
  estab_single_info,
  estab_single_maps,
  estab_single_images,
  comment_query,
  estab_comments, estab_count_comments,
  ratings_check_ip, ratings_query, ratings_rate
} = require("./Helpers/QueryHelpers");

var ipAddress;
publicIp.v4().then(ip => {
  ipAddress = ip;
});

exports.get_all_Hotel = (req, res) => {
  let userDetail = req.user || '';
  db.query(estab_get_all_query(2), (err, rows) => {
    if (err) {
      throw err;
    }
    res.render(`Client/Hotel`, {
      rows: rows,
      pageTitle: `Hotel in Abra`,
      route: "Hotels",
      userDetail: userDetail
    });
  });
};

exports.hotel_View = (req, res) => {
  let userDetail = req.user || '';
  let current_page = req.query.page || 1;
  let items_per_page = 4;
  let start_index = (current_page - 1) * items_per_page;
  let id = req.params.hotel_id;
  db.query(estab_single_info(id), (err, info_rows) => {
    if (err) {
      throw err;
    }

    db.query(estab_single_maps(id), (maps_err, maps_rows) => {
      if (maps_err) { throw maps_err; }

      db.query(estab_single_images(id), (images_err, images_rows) => {
        if (images_err) { throw images_err; }

        db.query(estab_count_comments(id), (errs, total_items) => {
          if (errs) { throw errs; }

          let total_pages = Math.ceil(total_items[0].total / items_per_page);

          db.query(estab_comments(id, start_index, items_per_page), (error, comments) => {
            if (error) { throw error; }

            db.query(ratings_check_ip(id, ipAddress), (log_err, isRated) => {
              if (log_err) { throw log_err; }

              var rated = (isRated.length >= 1) ? true : false;

              db.query(ratings_rate(id), (log_errs, rating) => {
                if (log_errs) { throw log_errs; }
                res.render("Client/Hotel/view", {
                  info_rows,
                  el_latitude: maps_rows.length ? maps_rows[0].el_latitude : "N/A",
                  el_lontitude: maps_rows.length ? maps_rows[0].el_lontitude : "N/A",
                  el_route: maps_rows.length ? maps_rows[0].el_route : "N/A",
                  images_rows,
                  id: id,
                  rating: rating,
                  isRated: isRated,
                  rated: rated,
                  total_pages: total_pages,
                  user: req.user == undefined ? "null" : req.user.user_no,
                  moment: moment,
                  comments: comments,
                  pageTitle: "Hotel Information",
                  route: "Hotels",
                  userDetail: userDetail
                });
              });
            });
          })
        });
      })
    })
  });
};

exports.hotel_comments = (req, res) => {
  let id = (req.user == undefined) ? "null" : req.user.user_no;
  let data = {
    estab_no: req.params.hotel_id,
    spot_no: 0,
    comm_guest: req.body.name || req.user.user_lname + ', ' + req.user.user_fname || "yes",
    comm_content: req.body.comment_content,
    comm_email: req.body.email || req.user.user_email || null,
    comm_ip: null,
    comm_date: moment().format()
  };

  publicIp.v4().then(ip => {
    db.query(comment_query(), [id, data.estab_no, data.spot_no, data.comm_guest, data.comm_content, data.comm_email, ip, data.comm_date], (err, rows) => {
      if (err) throw err;
      res.redirect(`/Hotels/${data.estab_no}`);
    });
  });
};

exports.hotel_ratings = (req, res) => {
  let id = (req.user == undefined) ? "null" : req.user.user_no;
  let data = {
    estab_no: req.params.hotel_id,
    spot_no: 0,
    rating_value: req.body.ratings,
    rating_ip: null,
    rating_date: moment().format()
  };

  publicIp.v4().then(ip => {
    db.query(ratings_query(id, data.estab_no, data.spot_no, data.rating_value, ip, data.rating_date), (err, result) => {
      if (err) throw err;
      res.redirect(`/Hotels/${data.estab_no}`);
    });
  });
};