const db = require("../../db.js");
const {
  top_destination_estab,
  top_destination_spot,
  searchHomePage,
  userRecommendation,
  userReconEstab,
  featured
} = require('./Helpers/QueryHelpers');

exports.get_all_Category = (req, res) => {
  let user = req.user || '';
  let search = req.query.search || null;

  db.query(
    `SELECT ec_name FROM establistments_category
    UNION
    SELECT sc_name FROM spots_category`,
    (err, rows) => {
      if (err) { throw err; }

      db.query(top_destination_estab(), (error, top_estab) => {
        if (error) { throw error; }

        db.query(top_destination_spot(), (spot_error, top_spot) => {
          if (spot_error) { throw spot_error; }

          db.query(searchHomePage(search), (search_err, search_res) => {
            if (search_err) { throw search_err; }

            db.query(userRecommendation(user), (user_err, user_recon) => {
              if (user_err) { throw user_err; }

              db.query(userReconEstab(user), (user_estab_err, userReconEstab) => {
                if (user_estab_err) { throw user_estab_err; }

                db.query(featured(), (fea_err, fea_row) => {
                  if (fea_err) { throw fea_err; }

                  db.query(`SELECT sa_name FROM spots_actualuse WHERE sa_inactive = 0 and sa_delete = 0`, (sa_err, sa_rows) => {
                    if (sa_err) { throw sa_err; }

                    if (search_res.length === 0) {
                      res.render("Client/", {
                        rows,
                        sa_rows,
                        search_res: "N/A",
                        search,
                        pageTitle: "Abra Travel Guide",
                        user: user,
                        user_recon,
                        userReconEstab,
                        fea_row,
                        top_estab,
                        top_spot
                      });
                    } else {
                      res.render("Client/", {
                        rows,
                        sa_rows,
                        search,
                        search_res,
                        pageTitle: "Abra Travel Guide",
                        user: user,
                        user_recon,
                        userReconEstab,
                        fea_row,
                        top_estab,
                        top_spot
                      });
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
};

exports.get_search = (req, res) => {
  let user = req.user || '';
  let search = req.query.search || null;

  db.query(searchHomePage(search), (search_err, search_res) => {
    if (search_err) { throw search_err; }
    console.log(search_res.length)
    res.render("Client/search", {
      search,
      search_res: (search_res.length == 0) ? 'N/A' : search_res,
      search_count: (search_res.length == 0) ? '0' : search_res.length,
      pageTitle: "Abra Travel Guide",
      user: user,
    });
  });
};

exports.get_search_api = (req, res) => {
  let search = req.query.search || null;

  db.query(searchHomePage(search), (api_err, api_res) => {
    if (api_err) { throw api_err; }

    return res.json({ api_res });
  });
};