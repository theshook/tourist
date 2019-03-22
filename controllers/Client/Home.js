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
                        top_spot,
                        login_message: (req.flash('loginMessage').length == 0) ? '' : req.flash('loginMessage')
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

  db.query(`SELECT ec_name FROM establistments_category
  UNION SELECT sc_name FROM spots_category`, (err, rows) => {
      if (err) { throw err; }
      db.query(searchHomePage(search), (search_err, search_res) => {
        if (search_err) { throw search_err; }
        console.log(search_res.length)
        res.render("Client/search", {
          rows,
          search,
          search_res: (search_res.length == 0) ? 'N/A' : search_res,
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

function prepareRatings(ratings) {
  console.log('Preparing Ratings ... \n');
  var ratingCountsByMovie = getRatingCountsByMovie(ratings);
  var ratingCountsByUser = getRatingCountsByUser(ratings);
  var POPULARITY_TRESHOLD = {
    movieRatings: 50,
    // be careful not to exclude the movies of your focused user
    userRatings: 5 // be careful not to exclude your focused user

  };
  console.log('(1) Group ratings by user');
  var ratingsGroupedByUser = getRatingsGroupedByUser(ratings, ratingCountsByMovie, ratingCountsByUser, POPULARITY_TRESHOLD);
  console.log('(2) Group ratings by movie \n');
  var ratingsGroupedByMovie = getRatingsGroupedByMovie(ratings, ratingCountsByMovie, ratingCountsByUser, POPULARITY_TRESHOLD);
  return {
    ratingsGroupedByUser: ratingsGroupedByUser,
    ratingsGroupedByMovie: ratingsGroupedByMovie
  };
}

function getRatingCountsByUser(ratings) {
  return ratings.reduce(function (result, value) {
    var userId = value.userId,
      rating = value.rating;

    if (!result[userId]) {
      result[userId] = 0;
    }

    result[userId]++;
    return result;
  }, {});
}

function getRatingCountsByMovie(ratings) {
  return ratings.reduce(function (result, value) {
    var movieId = value.movieId,
      rating = value.rating;

    if (!result[movieId]) {
      result[movieId] = 0;
    }

    result[movieId]++;
    return result;
  }, {});
}

function getRatingsGroupedByMovie(ratings, ratingCountsByMovie, ratingCountsByUser, popularityThreshold) {
  var movieRatings = popularityThreshold.movieRatings,
    userRatings = popularityThreshold.userRatings;
  return ratings.reduce(function (result, value) {
    var userId = value.userId,
      movieId = value.movieId,
      rating = value.rating,
      timestamp = value.timestamp;

    if (ratingCountsByMovie[movieId] < movieRatings || ratingCountsByUser[userId] < userRatings) {
      return result;
    }

    if (!result[movieId]) {
      result[movieId] = {};
    }

    result[movieId][userId] = {
      rating: Number(rating),
      timestamp: timestamp
    };
    return result;
  }, {});
}

function getRatingsGroupedByUser(ratings, ratingCounts, popularity) {
  return ratings.reduce(function (result, value) {
    var userId = value.userId,
      movieId = value.movieId,
      rating = value.rating;

    if (ratingCounts[movieId] < popularity) {
      return result;
    }

    if (!result[userId]) {
      result[userId] = {};
    }

    result[userId][movieId] = {
      rating: Number(rating)
    };
    return result;
  }, {});
}

function sliceAndDice(recommendations, MOVIES_BY_ID, count, onlyTitle) {
  recommendations = recommendations.filter(recommendation => MOVIES_BY_ID[recommendation.movieId]);

  recommendations = onlyTitle
    ? recommendations.map(mr => ({ title: MOVIES_BY_ID[mr.movieId].title, score: mr.score }))
    : recommendations.map(mr => ({ movie: MOVIES_BY_ID[mr.movieId], score: mr.score }));

  return recommendations
    .slice(0, count);
}