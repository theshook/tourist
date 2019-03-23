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
  ratings_check_ip, ratings_query, ratings_rate,
  visited_estab,
  userRecommendation,
  userReconEstab,
  notifications,
  estabGetSimilarity
} = require("./Helpers/QueryHelpers");

var ipAddress;
publicIp.v4().then(ip => {
  ipAddress = ip;
});

exports.get_all_Restaurant = (req, res) => {
  let userDetail = req.user || '';
  db.query(estab_get_all_query(1), (err, rows) => {
    if (err) {
      throw err;
    }
    res.render("Client/Restaurant", {
      rows: rows,
      pageTitle: "Restaurants in Abra",
      route: "restaurants",
      userDetail: userDetail
    });
  });
};

exports.restaurant_View = (req, res) => {

  let user_no = (req.user == undefined) ? 0 : req.user.user_no;

  let userDetail = req.user || '';
  let current_page = req.query.page || 1;
  let items_per_page = 4;
  let start_index = (current_page - 1) * items_per_page;
  let id = req.params.restaurant_id;

  db.query(estab_single_info(id), (err, info_rows) => {
    if (err) { throw err; }

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

                db.query(visited_estab(id, user_no, moment().format()), (visited_errs, visited_res) => {
                  if (visited_errs) { throw visited_errs; }

                  db.query(
                    `SELECT ec_name FROM establistments_category
                    UNION
                    SELECT sc_name FROM spots_category`, (cat_errs, cat_res) => {
                      if (cat_errs) { throw cat_errs; }

                      db.query(userReconEstab(id), (user_estab_err, userReconEstab) => {
                        if (user_estab_err) { throw user_estab_err; }

                        if (user_no == 0) {
                          res.render("Client/Restaurant/view", {
                            cat_res,
                            userReconEstab,
                            info_rows,
                            el_latitude: maps_rows.length ? maps_rows[0].el_latitude : "N/A",
                            el_lontitude: maps_rows.length ? maps_rows[0].el_lontitude : "N/A",
                            el_route: maps_rows.length ? maps_rows[0].el_route : "N/A",
                            images_rows: images_rows.length ? images_rows : "N/A",
                            id: id,
                            rating: rating,
                            isRated: isRated,
                            rated: rated,
                            total_pages: total_pages,
                            user: req.user == undefined ? "null" : req.user.user_no,
                            moment: moment,
                            comments: comments,
                            pageTitle: "Restaurant Information",
                            route: "restaurants",
                            userDetail: userDetail
                          });
                        } else {
                          estabGetSimilarity(db, user_no, (err, similarRows) => {
                            if (err) throw err;

                            res.render("Client/Restaurant/view", {
                              cat_res,
                              userReconEstab,
                              similarRows,
                              info_rows,
                              el_latitude: maps_rows.length ? maps_rows[0].el_latitude : "N/A",
                              el_lontitude: maps_rows.length ? maps_rows[0].el_lontitude : "N/A",
                              el_route: maps_rows.length ? maps_rows[0].el_route : "N/A",
                              images_rows: images_rows.length ? images_rows : "N/A",
                              id: id,
                              rating: rating,
                              isRated: isRated,
                              rated: rated,
                              total_pages: total_pages,
                              user: req.user == undefined ? "null" : req.user.user_no,
                              moment: moment,
                              comments: comments,
                              pageTitle: "Restaurant Information",
                              route: "restaurants",
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

exports.restaurant_comments = (req, res) => {
  let id = (req.user == undefined) ? "null" : req.user.user_no;
  let data = {
    estab_no: req.params.restaurant_id,
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

      db.query(notifications(), [data.spot_no, data.estab_no, data.comm_content, data.comm_guest, 'COMMENT', data.comm_date], (errs, notif) => {
        if (errs) throw err;
        res.redirect(`/restaurants/${data.estab_no}`);
      });
    });
  });
};

exports.restaurant_ratings = (req, res) => {
  let id = (req.user == undefined) ? "null" : req.user.user_no;
  let data = {
    estab_no: req.params.restaurant_id,
    spot_no: null,
    rating_value: req.body.ratings,
    rating_ip: null,
    rating_date: moment().format(),
    comm_guest: (req.user == undefined) ? "Guest" : req.user.user_lname + ', ' + req.user.user_fname
  };

  publicIp.v4().then(ip => {
    db.query(ratings_query(id, data.estab_no, data.spot_no, data.rating_value, ip, data.rating_date), (err, result) => {
      if (err) throw err;

      db.query(notifications(), [0, data.estab_no, data.rating_value, data.comm_guest, 'RATING', data.rating_date], (errs, notif) => {
        if (errs) throw err;
        res.redirect(`/restaurants/${data.estab_no}`);
      });
    });
  });
};