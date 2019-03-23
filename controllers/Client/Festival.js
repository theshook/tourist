const db = require("../../db.js");
var moment = require("moment");
const publicIp = require("public-ip");

const {
  spot_get_all_query,
  spot_get_single_query,
  spot_single_maps,
  spot_single_images,
  spot_count_comments,
  spot_comments,
  spot_ratings_check_ip,
  spot_ratings_rate,
  comment_query,
  ratings_query,
  visited_spot,
  userRecommendation,
  userReconEstab,
  notifications,
  spotsGetSimilarity
} = require('./Helpers/QueryHelpers');

var ipAddress;
publicIp.v4().then(ip => {
  ipAddress = ip;
});

exports.get_all_Waterfall = (req, res) => {
  let userDetail = req.user || '';
  db.query(
    spot_get_all_query(1),
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/Spot/Festival", {
        rows: rows,
        pageTitle: "Festival in Abra",
        route: "festival",
        userDetail: userDetail
      });
    }
  );
};

exports.Waterfall_View = (req, res) => {
  let user_no = (req.user == undefined) ? 0 : req.user.user_no;

  let userDetail = req.user || '';
  let current_page = req.query.page || 1;
  let items_per_page = 4;
  let start_index = (current_page - 1) * items_per_page;
  let id = req.params.waterfall_id;
  db.query(spot_get_single_query(id), (err, info_rows) => {
    if (err) { throw err; }

    db.query(spot_single_maps(id), (maps_err, maps_rows) => {
      if (maps_err) { throw maps_err; }

      db.query(spot_single_images(id), (images_err, images_rows) => {
        if (images_err) { throw images_err; }

        db.query(spot_count_comments(id), (errs, total_items) => {
          if (errs) { throw errs; }

          let total_pages = Math.ceil(total_items[0].total / items_per_page);

          db.query(spot_comments(id, start_index, items_per_page), (error, comments) => {
            if (error) { throw error; }

            db.query(spot_ratings_check_ip(id, ipAddress), (log_err, isRated) => {
              if (log_err) { throw log_err; }

              var rated = (isRated.length >= 1) ? true : false;

              db.query(spot_ratings_rate(id), (log_errs, rating) => {
                if (log_errs) { throw log_errs; }

                db.query(visited_spot(id, user_no, moment().format()), (visited_errs, visited_res) => {
                  if (visited_errs) { throw visited_errs; }

                  db.query(
                    `SELECT ec_name FROM establistments_category
                    UNION
                    SELECT sc_name FROM spots_category`, (cat_errs, cat_res) => {
                      if (cat_errs) { throw cat_errs; }

                      db.query(userRecommendation(user_no), (user_err, user_recon) => {
                        if (user_err) { throw user_err; }

                        if (user_no == 0) {
                          res.render("Client/Spot/Festival/view", {
                            cat_res,
                            info_rows,
                            user_recon,
                            sl_latitude: maps_rows.length ? maps_rows[0].sl_latitude : "N/A",
                            sl_lontitude: maps_rows.length ? maps_rows[0].sl_lontitude : "N/A",
                            sl_route: maps_rows.length ? maps_rows[0].sl_route : "N/A",
                            images_rows: images_rows.length ? images_rows : "N/A",
                            id: id,
                            rating: rating,
                            isRated: isRated,
                            rated: rated,
                            total_pages: total_pages,
                            user: req.user == undefined ? "null" : req.user.user_no,
                            moment: moment,
                            comments: comments,
                            pageTitle: "Festival Information",
                            route: "festival",
                            userDetail: userDetail
                          });
                        } else {
                          spotsGetSimilarity(db, user_no, (err, similarRows) => {
                            if (err) { throw err; }
                            res.render("Client/Spot/Festival/view", {
                              cat_res,
                              info_rows,
                              user_recon,
                              similarRows,
                              sl_latitude: maps_rows.length ? maps_rows[0].sl_latitude : "N/A",
                              sl_lontitude: maps_rows.length ? maps_rows[0].sl_lontitude : "N/A",
                              sl_route: maps_rows.length ? maps_rows[0].sl_route : "N/A",
                              images_rows: images_rows.length ? images_rows : "N/A",
                              id: id,
                              rating: rating,
                              isRated: isRated,
                              rated: rated,
                              total_pages: total_pages,
                              user: req.user == undefined ? "null" : req.user.user_no,
                              moment: moment,
                              comments: comments,
                              pageTitle: "Fectival Information",
                              route: "festival",
                              userDetail: userDetail
                            });
                          });
                        }
                      });
                    });
                });
              });
            });
          })
        });
      })
    })
  });
};

exports.spot_comments = (req, res) => {
  let id = (req.user == undefined) ? "null" : req.user.user_no;
  let data = {
    estab_no: 0,
    spot_no: req.params.waterfall_id,
    comm_guest: req.body.name || req.user.user_lname + ', ' + req.user.user_fname || "yes",
    comm_content: req.body.comment_content,
    comm_email: req.body.email || req.user.user_email || null,
    comm_ip: null,
    comm_date: moment().format()
  };

  publicIp.v4().then(ip => {
    db.query(comment_query(), [id, data.estab_no, data.spot_no, data.comm_guest, data.comm_content, data.comm_email, ip, data.comm_date], (err, rows) => {
      if (err) throw err;

      db.query(notifications(), [data.spot_no, data.estab_no, data.comm_content, data.comm_guest, 'COMMENT', data.comm_date], (errs, notif) => {
        if (errs) throw err;
        res.redirect(`/festival/${data.spot_no}`);
      });
    });
  });
};

exports.spot_ratings = (req, res) => {
  let id = (req.user == undefined) ? "null" : req.user.user_no;
  let data = {
    estab_no: 0,
    spot_no: req.params.waterfall_id,
    rating_value: req.body.ratings,
    rating_ip: null,
    rating_date: moment().format(),
    comm_guest: (req.user == undefined) ? "Guest" : req.user.user_lname + ', ' + req.user.user_fname
  };

  publicIp.v4().then(ip => {
    db.query(ratings_query(id, data.estab_no, data.spot_no, data.rating_value, ip, data.rating_date), (err, result) => {
      if (err) throw err;

      db.query(notifications(), [data.spot_no, data.estab_no, data.rating_value, data.comm_guest, 'RATING', data.rating_date], (errs, notif) => {
        if (errs) throw err;
        res.redirect(`/festival/${data.spot_no}`);
      });
    });
  });
};