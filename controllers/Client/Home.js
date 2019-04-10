const db = require("../../db.js");
const {
  top_destination_estab,
  top_destination_spot,
  searchHomePage,
  userRecommendation,
  userReconEstab,
  featured,
  estabGetSimilarity,
  spotsGetSimilarity
} = require('./Helpers/QueryHelpers');

exports.get_all_Category = (req, res) => {
  let user = req.user || '';
  let userId = (req.user == undefined) ? 0 : req.user.user_no;

  db.query(`SELECT ec_name FROM establistments_category UNION SELECT sc_name FROM spots_category`, (err, rows) => {
    if (err) throw err;

    db.query(top_destination_estab(), (error, top_estab) => {
      if (error) { throw error; }

      db.query(featured(), (fea_err, fea_row) => {
        if (fea_err) { throw fea_err; }

        db.query(`SELECT sa_name FROM spots_actualuse WHERE sa_inactive = 0 and sa_delete = 0`, (sa_err, sa_rows) => {
          if (sa_err) { throw sa_err; }

          db.query(top_destination_spot(), (err, top_spot) => {
            if (err) throw err;

            if (userId == 0) {
              db.query(userRecommendation(user), (user_err, user_recon) => {
                if (user_err) { throw user_err; }

                db.query(userReconEstab(user), (user_estab_err, userReconEstab) => {
                  if (user_estab_err) { throw user_estab_err; }

                  res.render("Client/", {
                    rows,
                    sa_rows,
                    top_spot,
                    pageTitle: "Abra Travel Guide",
                    user: user,
                    user_recon,
                    userReconEstab,
                    fea_row,
                    top_estab,
                    login_message: (req.flash('loginMessage').length == 0) ? '' : req.flash('loginMessage')
                  });
                });
              });
            } else {
              spotsGetSimilarity(db, userId, (err, user_recon) => {
                if (err) throw err;

                estabGetSimilarity(db, userId, (err, userReconEstab) => {
                  if (err) throw err;

                  res.render("Client/", {
                    rows,
                    sa_rows,
                    top_spot,
                    pageTitle: "Abra Travel Guide",
                    user: user,
                    user_recon,
                    userReconEstab,
                    fea_row,
                    top_estab,
                    login_message: (req.flash('loginMessage').length == 0) ? '' : req.flash('loginMessage')
                  });
                });
              });
            }
          });
        });
      });
    });
  });
};

exports.get_search = (req, res) => {
  let user = req.user || '';
  let search = req.query.search || null;
  let destination = req.query.destination || null;
  let filtering = req.query.filtering || null;
  let prices = req.query.prices || null;
  let dcat;
  let fcat;

  if (destination == 'ilocano') {
    dcat = 'Ilocano Delicacies'
  } else if (destination == 'banks') {
    dcat = 'Banks & Atms'
  } else if (destination == 'church') {
    dcat = 'Churches & Structures'
  } else {
    dcat = destination
  }

  if (filtering == 'popularity') {
    fcat = 'RATES';
  } else if (filtering == 'recents') {
    fcat = 'id'
  } else if (filtering == 'featured') {
    fcat = 'featured';
  }

  db.query(`SELECT ec_name FROM establistments_category
  UNION SELECT sc_name FROM spots_category`, (err, rows) => {
      if (err) { throw err; }
      db.query(searchHomePage(search, dcat, fcat, prices), (search_err, search_res) => {
        if (search_err) { throw search_err; }

        res.render("Client/search", {
          rows,
          search,
          destination: dcat,
          filtering,
          prices,
          search_res,
          search_count: (search_res.length == 0) ? '0' : search_res.length,
          pageTitle: "Abra Travel Guide",
          user: user,
        });
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
