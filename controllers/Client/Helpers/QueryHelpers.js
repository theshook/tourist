// Spots Similarity
var similarity = require('cosine-similarity');
exports.estabGetSimilarity = (db, user_no, callback) => {
  let iUsers = [];
  let otherUsers = {};
  let idSimilar = 0;
  let cosSimilarity = 0.0;
  db.query(`SELECT user_no, ratings.estab_no, estab_name, rating_value
FROM ratings INNER JOIN establistments ON ratings.estab_no = establistments.estab_no 
  WHERE user_no != 0 AND ratings.estab_no != 0 AND user_no = ${user_no}`, (err, rows) => {
      db.query(`SELECT user_no, ratings.estab_no, estab_name, rating_value
    FROM ratings INNER JOIN establistments ON ratings.estab_no = establistments.estab_no 
      WHERE user_no != 0 AND ratings.estab_no != 0 AND user_no != ${user_no}`, (rerr, ratings) => {
          if (rerr) throw rerr;


          for (i = 0; i < rows.length; i++) {
            iUsers.push(rows[i].rating_value);
          }


          for (i = 0; i < ratings.length; i++) {
            otherUsers[ratings[i].user_no] = [];
          }

          for (let key in otherUsers) {
            for (i = 0; i < ratings.length; i++) {
              if (key == ratings[i].user_no) {
                otherUsers[ratings[i].user_no].push(ratings[i].rating_value)
              }
            }
          }


          for (var key in otherUsers) {
            if (otherUsers.hasOwnProperty(key)) {
              if (similarity(iUsers, otherUsers[key]) < 1) {
                if (cosSimilarity < similarity(iUsers, otherUsers[key])) {
                  cosSimilarity = similarity(iUsers, otherUsers[key]);
                  idSimilar = key;
                  // console.log(`User ID:${key} ->`,
                  //   `Cosine Similarity: ${similarity(iUsers, otherUsers[key])}`);
                }
              }
            }
          }

          // console.log(idSimilar, cosSimilarity);

          db.query(`SELECT establistments.ec_no, establistments.estab_no, ratings.user_no,establistments.estab_name, establistments_category.ec_name, establistments_photo.image_filename, round(SUM(rating_value)/COUNT(*), 2) as RATES,
          count(ratings.estab_no) as Num_of_Rates
          FROM ratings 
          INNER JOIN establistments ON ratings.estab_no = establistments.estab_no 
          INNER JOIN users ON ratings.user_no = ratings.user_no
          INNER JOIN establistments_category ON establistments_category.ec_no = establistments.ec_no
          INNER JOIN establistments_photo ON establistments_photo.estab_no = establistments.estab_no
          WHERE ratings.user_no = '${idSimilar}'
          AND NOT ratings.user_no = 0
          AND establistments_photo.image_isprimary = 1
          GROUP BY ratings.estab_no
          LIMIT 1, 6`, (err, result) => {
              if (err) { throw err; }
              callback(null, result);
            });
        });
    });
}
exports.spotsGetSimilarity = (db, user_no, callback) => {
  let iUsers = [];
  let otherUsers = {};
  let idSimilar = 0;
  let cosSimilarity = 0.0;
  db.query(`SELECT user_no, ratings.spot_no, spot_name, rating_value
FROM ratings INNER JOIN spots ON ratings.spot_no = spots.spot_no 
  WHERE user_no != 0 AND ratings.spot_no != 0 AND user_no = ${user_no}`, (err, rows) => {
      db.query(`SELECT user_no, ratings.spot_no, spot_name, rating_value
    FROM ratings INNER JOIN spots ON ratings.spot_no = spots.spot_no 
      WHERE user_no != 0 AND ratings.spot_no != 0 AND user_no != ${user_no}`, (rerr, ratings) => {
          if (rerr) throw rerr;


          for (i = 0; i < rows.length; i++) {
            iUsers.push(rows[i].rating_value);
          }


          for (i = 0; i < ratings.length; i++) {
            otherUsers[ratings[i].user_no] = [];
          }

          for (let key in otherUsers) {
            for (i = 0; i < ratings.length; i++) {
              if (key == ratings[i].user_no) {
                otherUsers[ratings[i].user_no].push(ratings[i].rating_value)
              }
            }
          }


          for (var key in otherUsers) {
            if (otherUsers.hasOwnProperty(key)) {
              if (similarity(iUsers, otherUsers[key]) < 1) {
                if (cosSimilarity < similarity(iUsers, otherUsers[key])) {
                  cosSimilarity = similarity(iUsers, otherUsers[key]);
                  idSimilar = key;
                  // console.log(`User ID:${key} ->`,
                  //   `Cosine Similarity: ${similarity(iUsers, otherUsers[key])}`);
                }
              }
            }
          }

          // console.log(idSimilar, cosSimilarity);

          db.query(`SELECT spots.spot_no, spots.spot_name, spots_category.sc_name, spots_photo.img_filename, round(SUM(rating_value)/COUNT(*), 2) as RATES,
          count(ratings.spot_no) as Num_of_Rates
          FROM ratings 
          INNER JOIN spots ON ratings.spot_no = spots.spot_no 
          INNER JOIN users ON ratings.user_no = ratings.user_no
          INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
          INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
          WHERE ratings.user_no = ${idSimilar} AND NOT ratings.user_no = 0
            AND spots_photo.img_isprimary = 1
          GROUP BY ratings.spot_no
          LIMIT 1, 6`, (err, result) => {
              if (err) { throw err; }
              callback(null, result);
            });
        });
    });
}

// Top 6 based on category
exports.topDestination = (category) => {
  let cat;
  if (category == 'ilocano') {
    cat = 'Ilocano Delicacies'
  } else if (category == 'banks') {
    cat = 'Banks & Atms'
  } else if (category == 'church') {
    cat = 'Churches & Structures'
  } else {
    cat = category
  }

  return `SELECT 
  round(SUM(rating_value)/COUNT(*), 2) as RATES,
  count(ratings.estab_no) as Num_of_Rates,
  image_filename,
  estab_name,
  ec_name,
  establistments.estab_no
  FROM ratings 
  INNER JOIN establistments_photo ON ratings.estab_no = establistments_photo.estab_no
  INNER JOIN establistments ON ratings.estab_no = establistments.estab_no
  INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no
  WHERE (rating_inactive=0 AND rating_delete=0) 
  AND image_isprimary=1 
  AND ec_name="${cat}"
  GROUP BY ratings.estab_no HAVING RATES >= 3.5
UNION
SELECT 
  round(SUM(rating_value)/COUNT(*), 2) as RATES,
  count(ratings.spot_no) as Num_of_Rates,
  img_filename,
  spot_name,
  sc_name,
  spots.spot_no
  FROM ratings 
  INNER JOIN spots_photo ON ratings.spot_no = spots_photo.spot_no
  INNER JOIN spots ON ratings.spot_no = spots.spot_no
  INNER JOIN spots_category ON spots.sc_no = spots_category.sc_no
  WHERE (rating_inactive=0 AND rating_delete=0) 
  AND img_isprimary=1 
  AND sc_name="${cat}"
  GROUP BY ratings.spot_no HAVING RATES >= 3.5`;
}

// LOG_FILE INSERT QUERY
exports.log_file_query = () => {
  return `
  INSERT INTO log_file 
  (log_file_name, log_file_email, log_file_action, log_file_target, log_file_created_at)
  VALUES (?, ?, ?, ?, ?)`
}

exports.log_file = () => {
  return `SELECT * FROM log_file ORDER BY id_log_file DESC`
}
// END LOG_FILE

// ESTABLISHMENTS QUERY
exports.estab_maps = () => {
  return `SELECT
  establistments.estab_no as "estab_no",
  estab_name,
  estab_description,
  el_latitude,
  el_lontitude,
  el_route,
  ec_name
  FROM establistments
  INNER JOIN establistments_location ON establistments_location.estab_no = establistments.estab_no
  INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no
UNION
SELECT
  spots.spot_no as "estab_no",
  spot_name,
  spot_description,
  sl_latitude,
  sl_lontitude,
  sl_route,
  sc_name
  FROM spots
  INNER JOIN spots_location ON spots_location.spot_no = spots.spot_no
  INNER JOIN spots_category ON spots.sc_no = spots_category.sc_no`
}

exports.estab_get_all_query = ec_no => {
  return `SELECT 
  establistments.estab_no,
  estab_name,
  estab_description,
  towns.town_name,
  establistments_photo.image_filename,
  round(SUM(rating_value)/COUNT(*), 2) as RATES,
  count(ratings.estab_no) as Num_of_Rates
  FROM establistments 
  INNER JOIN towns ON establistments.town_no = towns.town_no 
  INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no 
  INNER JOIN establistments_photo ON establistments.estab_no = establistments_photo.estab_no
  LEFT JOIN ratings ON establistments.estab_no = ratings.estab_no
  WHERE (encode_delete=0 AND encode_inactive=0) AND 
  establistments.ec_no=${ec_no} AND establistments_photo.image_isprimary=1
  GROUP BY estab_no
  order by estab_no ASC`;
};

exports.estab_single_info = (id) => {
  return `SELECT 
  establistments.estab_no,
  estab_name,
  estab_description,
  estab_address, 
  towns.town_name,
  barangays.bar_name,
  estab_contact,
  estab_email
  FROM establistments
  INNER JOIN barangays ON barangays.bar_no = establistments.bar_no
  INNER JOIN towns ON towns.town_no = establistments.town_no
  WHERE establistments.estab_no = ${id}`;
};

exports.estab_single_maps = (id) => {
  return `SELECT 
  el_latitude, 
  el_lontitude, 
  el_route 
  FROM establistments_location 
  WHERE establistments_location.estab_no = ${id}`
};

exports.estab_single_images = (id) => {
  return `SELECT 
  image_filename 
  FROM establistments_photo 
  WHERE establistments_photo.estab_no = ${id}`
};

exports.estab_count_comments = (id) => {
  return `SELECT COUNT(*) as total FROM comments WHERE estab_no = ${id} AND (comm_inactive=0 AND comm_delete=0)`;
}

exports.estab_comments = (id, start, end) => {
  return `SELECT user_no, estab_no, comm_guest, comm_content, comm_date FROM comments WHERE estab_no = ${id} AND (comm_inactive=0 AND comm_delete=0) ORDER BY comm_date DESC LIMIT ${start}, ${end}`;
}

// *********************************** SPOTS QUERY ************************************ \\
exports.spot_get_all_query = sc_no => {
  return `SELECT 
  spots.spot_no,
  spot_name,
  spot_subname,
  spot_description, 
  spots_photo.img_filename,
  round(SUM(rating_value)/COUNT(*), 2) as RATES,
  count(ratings.estab_no) as Num_of_Rates
  FROM spots
  INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
  INNER JOIN barangays ON barangays.bar_no = spots.bar_no
  INNER JOIN towns ON towns.town_no = spots.town_no
  INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
  LEFT JOIN ratings ON spots.spot_no = ratings.spot_no
  WHERE spots_photo.img_isprimary=1 AND 
  spots.sc_no=${sc_no}
	GROUP BY spot_no`;
};

exports.spot_get_single_query = sc_no => {
  return `SELECT 
  spots.spot_no,
  spot_name,
  spot_subname,
  spot_description, 
  towns.town_name,
  barangays.bar_name
  FROM spots
  INNER JOIN barangays ON barangays.bar_no = spots.bar_no
  INNER JOIN towns ON towns.town_no = spots.town_no
  WHERE spots.spot_no=${sc_no}`;
};

exports.spot_single_maps = (id) => {
  return `SELECT 
  sl_latitude, 
  sl_lontitude, 
  sl_route 
  FROM spots_location 
  WHERE spots_location.spot_no = ${id}`
};

exports.spot_single_images = (id) => {
  return `SELECT 
  img_filename 
  FROM spots_photo 
  WHERE spots_photo.spot_no = ${id}`
};

exports.spot_count_comments = (id) => {
  return `SELECT COUNT(*) as total FROM comments WHERE spot_no = ${id} AND (comm_inactive=0 AND comm_delete=0)`;
}

exports.spot_comments = (id, start, end) => {
  return `SELECT user_no, estab_no, comm_guest, comm_content, comm_date FROM comments WHERE spot_no = ${id} AND (comm_inactive=0 AND comm_delete=0) ORDER BY comm_date DESC LIMIT ${start}, ${end}`;
}

exports.spot_ratings_check_ip = (id, ip) => {
  return `SELECT * FROM ratings WHERE (rating_ip = '${ip}' AND spot_no = '${id}') AND (rating_inactive=0 AND rating_delete=0)`;
};

exports.spot_ratings_rate = (id) => {
  return `SELECT round(SUM(rating_value)/COUNT(*), 2) as RATES FROM ratings WHERE spot_no='${id}' AND (rating_inactive=0 AND rating_delete=0) GROUP BY spot_no`;
};

// Comments, Ratings, And Ip Sections
exports.comment_query = () => {
  return `INSERT INTO comments (user_no, estab_no, spot_no, comm_guest, comm_content, comm_email, comm_ip, comm_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
};

exports.ratings_query = (user_no, estab_no, spot_no, rating_value, rating_ip, rating_date) => {
  return `INSERT INTO ratings (user_no, estab_no, spot_no, rating_value, rating_ip, rating_date) VALUES ('${user_no}', '${estab_no}', '${spot_no}', '${rating_value}', '${rating_ip}', '${rating_date}')`;
};

exports.ratings_check_ip = (id, ip) => {
  return `SELECT * FROM ratings WHERE (rating_ip = '${ip}' AND estab_no = '${id}') AND (rating_inactive=0 AND rating_delete=0)`;
};

exports.ratings_rate = (id) => {
  return `SELECT round(SUM(rating_value)/COUNT(*), 2) as RATES FROM ratings WHERE estab_no='${id}' AND (rating_inactive=0 AND rating_delete=0) GROUP BY estab_no`;
};

// **************************************************************************************************
// Visited Query
// **************************************************************************************************
exports.visited_estab = (estab_no, user_no, visit_date) => {
  return `
  INSERT INTO visited
  (spot_no,
  estab_no,
  user_no,
  visit_date)
  VALUES
  (0, ${estab_no}, ${user_no}, '${visit_date}');
  `;
};

exports.visited_spot = (spot_no, user_no, visit_date) => {
  return `
  INSERT INTO visited
  (spot_no,
  estab_no,
  user_no,
  visit_date)
  VALUES
  (${spot_no}, 0, ${user_no}, '${visit_date}');
  `;
};

// TOP DESTINATIONS
exports.top_destination_estab = () => {
  return `SELECT 
  round(SUM(rating_value)/COUNT(*), 2) as RATES,
  count(ratings.estab_no) as Num_of_Rates,
  image_filename,
  estab_name,
  ec_name,
  establistments.estab_no
  FROM ratings 
  INNER JOIN establistments_photo ON ratings.estab_no = establistments_photo.estab_no
  INNER JOIN establistments ON ratings.estab_no = establistments.estab_no
  INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no
  WHERE (rating_inactive=0 AND rating_delete=0) AND image_isprimary=1 GROUP BY ratings.estab_no HAVING RATES >= 4 ORDER BY RATES DESC`;
};

exports.top_destination_spot = () => {
  return `SELECT 
  round(SUM(rating_value)/COUNT(*), 2) as RATES,
  count(ratings.estab_no) as Num_of_Rates,
  img_filename,
  spot_name,
  sc_name,
  spots.spot_no
  FROM ratings 
  INNER JOIN spots_photo ON ratings.spot_no = spots_photo.spot_no
  INNER JOIN spots ON ratings.spot_no = spots.spot_no
  INNER JOIN spots_category ON spots.sc_no = spots_category.sc_no
  WHERE (rating_inactive=0 AND rating_delete=0) AND img_isprimary=1 GROUP BY ratings.spot_no HAVING RATES >= 4 ORDER BY RATES DESC`;
}

//***************************************************************************************//
//********************************************************************** Search Functions//
//***************************************************************************************//

exports.searchHomePage = (search_q, category, popularity, prices) => {

  if (popularity == null) {
    popularity = 'RAND()';
  }
  if (popularity == 'id') {
    if (category != null)
      return searchHomePageByCategory(category, popularity);
    else
      return searchHomePageByRecents(popularity);
  } else if (popularity == 'featured') {
    return searchHomePageByFeatured();
  } else if (search_q == 'hotel' || search_q == 'hotels' || search_q == 'Hotel' || search_q == 'Hotels' || search_q == 'HOTEL' || search_q == 'HOTELS' || category != null) {
    if (category == 'hotels' || search_q == 'hotel' || search_q == 'hotels' || search_q == 'Hotel' || search_q == 'Hotels' || search_q == 'HOTEL' || search_q == 'HOTELS') {
      if (prices == null) {
        prices = 1000;
      }
      return `SELECT 
      establistments.estab_no as id,
      estab_name,
      estab_description,
      establistments_photo.image_filename,
      establistments_category.ec_name,
      round(SUM(rating_value)/COUNT(*), 2) as RATES,
      convert(k_keyword, unsigned) as price
      FROM establistments 
      INNER JOIN towns ON establistments.town_no = towns.town_no 
      INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no 
      INNER JOIN establistments_photo ON establistments.estab_no = establistments_photo.estab_no
      INNER JOIN establistments_location ON establistments.estab_no = establistments_location.estab_no
      INNER JOIN keywords ON establistments.estab_no = keywords.k_estab_no
      LEFT JOIN ratings ON ratings.estab_no = establistments.estab_no
      WHERE 
      ((encode_delete=0 AND encode_inactive=0) AND establistments_photo.image_isprimary=1)
      AND estab_name LIKE '%${search_q}%' 
      OR towns.town_name LIKE '%${search_q}%' 
      OR establistments_category.ec_name LIKE '%${search_q}%'
      GROUP BY price, establistments.estab_no
      HAVING price <= ${prices} AND price != 0
      UNION
      SELECT 
      spots.spot_no as id,
      spot_name,
      spot_description, 
      spots_photo.img_filename,
      spots_category.sc_name,
      round(SUM(rating_value)/COUNT(*), 2) as RATES,
      convert(k_keyword, unsigned) as price
      FROM spots
      INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
      INNER JOIN barangays ON barangays.bar_no = spots.bar_no
      INNER JOIN towns ON towns.town_no = spots.town_no
      INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
      INNER JOIN keywords ON spots.spot_no = keywords.k_spot_no
      LEFT JOIN ratings ON ratings.spot_no = spots.spot_no
      INNER JOIN spots_location ON spots_location.spot_no = spots_location.spot_no
      WHERE 
      spots_photo.img_isprimary=1 
      AND spot_name LIKE '%${search_q}%' 
      OR spot_subname LIKE '%${search_q}%' 
      OR towns.town_name LIKE '%${search_q}%' 
      OR spots_category.sc_name LIKE '%${search_q}%' 
      GROUP BY price, spots.spot_no
      HAVING price <= ${prices} AND price != 0
      ORDER BY ${popularity} DESC`;
    }
    return searchHomePageByCategory(category, popularity);
  } else {
    return `SELECT 
      establistments.estab_no as id,
      estab_name,
      estab_description,
      establistments_photo.image_filename,
      establistments_category.ec_name,
      round(SUM(rating_value)/COUNT(*), 2) as RATES
      FROM establistments 
      INNER JOIN towns ON establistments.town_no = towns.town_no 
      INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no 
      INNER JOIN establistments_photo ON establistments.estab_no = establistments_photo.estab_no
      INNER JOIN establistments_location ON establistments.estab_no = establistments_location.estab_no
      INNER JOIN keywords ON establistments.estab_no = keywords.k_estab_no
      LEFT JOIN ratings ON ratings.estab_no = establistments.estab_no
      WHERE ((encode_delete=0 AND encode_inactive=0) AND establistments_photo.image_isprimary=1)
      AND estab_name LIKE '%${search_q}%' 
      OR towns.town_name LIKE '%${search_q}%' 
      OR establistments_category.ec_name LIKE '%${search_q}%'
      OR k_keyword LIKE '${search_q}%'
      GROUP BY establistments.estab_no
      UNION
      SELECT 
      spots.spot_no as id,
      spot_name,
      spot_description, 
      spots_photo.img_filename,
      spots_category.sc_name,
      round(SUM(rating_value)/COUNT(*), 2) as RATES
      FROM spots
      INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
      INNER JOIN barangays ON barangays.bar_no = spots.bar_no
      INNER JOIN towns ON towns.town_no = spots.town_no
      INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
      INNER JOIN keywords ON spots.spot_no = keywords.k_spot_no
      LEFT JOIN ratings ON ratings.spot_no = spots.spot_no
      INNER JOIN spots_location ON spots_location.spot_no = spots_location.spot_no
      WHERE spots_photo.img_isprimary=1 
      AND spot_name LIKE '%${search_q}%' 
      OR spot_subname LIKE '%${search_q}%' 
      OR towns.town_name LIKE '%${search_q}%' 
      OR spots_category.sc_name LIKE '%${search_q}%' 
      OR k_keyword LIKE '${search_q}%'
      GROUP BY spots.spot_no
      ORDER BY ${popularity} DESC`;
  }
}

searchHomePageByCategory = (category, popularity) => {
  return `SELECT 
  establistments.estab_no as id,
  estab_name,
  estab_description,
  establistments_photo.image_filename,
  establistments_category.ec_name,
  round(SUM(rating_value)/COUNT(*), 2) as RATES
  FROM establistments 
  INNER JOIN towns ON establistments.town_no = towns.town_no 
  INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no 
  INNER JOIN establistments_photo ON establistments.estab_no = establistments_photo.estab_no
  INNER JOIN establistments_location ON establistments.estab_no = establistments_location.estab_no
  LEFT JOIN ratings ON ratings.estab_no = establistments.estab_no
  WHERE ((encode_delete=0 AND encode_inactive=0) AND establistments_photo.image_isprimary=1)
  AND establistments_category.ec_name = '${category}'
  GROUP BY establistments.estab_no
  UNION
  SELECT 
  spots.spot_no as id,
  spot_name,
  spot_description, 
  spots_photo.img_filename,
  spots_category.sc_name,
  round(SUM(rating_value)/COUNT(*), 2) as RATES
  FROM spots
  INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
  INNER JOIN barangays ON barangays.bar_no = spots.bar_no
  INNER JOIN towns ON towns.town_no = spots.town_no
  INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
  LEFT JOIN ratings ON ratings.spot_no = spots.spot_no
  INNER JOIN spots_location ON spots_location.spot_no = spots_location.spot_no
  WHERE spots_photo.img_isprimary=1 
  AND spots_category.sc_name = '${category}' 
  GROUP BY spots.spot_no
  ORDER BY ${popularity} DESC`;
}

searchHomePageByRecents = (popularity) => {
  return `SELECT 
  establistments.estab_no as id,
  estab_name,
  estab_description,
  establistments_photo.image_filename,
  establistments_category.ec_name,
  round(SUM(rating_value)/COUNT(*), 2) as RATES
  FROM establistments 
  INNER JOIN towns ON establistments.town_no = towns.town_no 
  INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no 
  INNER JOIN establistments_photo ON establistments.estab_no = establistments_photo.estab_no
  INNER JOIN establistments_location ON establistments.estab_no = establistments_location.estab_no
  LEFT JOIN ratings ON ratings.estab_no = establistments.estab_no
  WHERE ((encode_delete=0 AND encode_inactive=0) AND establistments_photo.image_isprimary=1)
  GROUP BY establistments.estab_no
  UNION
  SELECT 
  spots.spot_no as id,
  spot_name,
  spot_description, 
  spots_photo.img_filename,
  spots_category.sc_name,
  round(SUM(rating_value)/COUNT(*), 2) as RATES
  FROM spots
  INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
  INNER JOIN barangays ON barangays.bar_no = spots.bar_no
  INNER JOIN towns ON towns.town_no = spots.town_no
  INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
  LEFT JOIN ratings ON ratings.spot_no = spots.spot_no
  INNER JOIN spots_location ON spots_location.spot_no = spots_location.spot_no
  WHERE spots_photo.img_isprimary=1 
  GROUP BY spots.spot_no
  ORDER BY ${popularity} DESC`;
}

searchHomePageByFeatured = () => {
  return `
  SELECT 
    round(SUM(rating_value)/COUNT(*), 2) as RATES,
    count(ratings.estab_no) as Num_of_Rates,
    establistments.estab_no, 
    estab_name,
    estab_description,
    establistments_category.ec_name, 
    establistments_photo.image_filename
  FROM ratings
    INNER JOIN establistments ON ratings.estab_no = establistments.estab_no
    INNER JOIN establistments_category ON establistments_category.ec_no = establistments.ec_no
    INNER JOIN featured ON ratings.estab_no = featured.estab_no
    INNER JOIN establistments_photo ON establistments_photo.estab_no = featured.estab_no
      WHERE establistments.estab_no = featured.estab_no AND establistments_photo.image_isprimary = 1
        GROUP BY establistments.estab_no  
UNION
  SELECT 
    round(SUM(rating_value)/COUNT(*), 2) as RATES,
    count(ratings.spot_no) as Num_of_Rates,
    spots.spot_no,
    spot_name,
    spot_description,
    spots_category.sc_name,
    spots_photo.img_filename
  FROM ratings
  INNER JOIN spots ON ratings.spot_no = spots.spot_no
  INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
  INNER JOIN featured ON ratings.spot_no = featured.spot_no
  INNER JOIN spots_photo ON spots_photo.spot_no = featured.spot_no
    WHERE spots.spot_no = featured.spot_no AND spots_photo.img_isprimary = 1
      GROUP BY spots.spot_no
    `;
}

//***************************************************************************************//
//****************************************************************** End Search Functions//
//***************************************************************************************//

exports.userRecommendation = (spot_no) => {
  return `SELECT spots.spot_no, spots.spot_name, k_keyword, spots_category.sc_name,   
    spots_photo.img_filename, round(SUM(rating_value)/COUNT(*), 2) as RATES
  FROM ratings 
  INNER JOIN spots ON ratings.spot_no = spots.spot_no 
  INNER JOIN users ON ratings.user_no = ratings.user_no
  INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
  INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
  INNER JOIN keywords ON spots.spot_no = keywords.k_spot_no
  WHERE NOT ratings.spot_no = '${spot_no}' AND NOT ratings.spot_no = 0
    AND spots_photo.img_isprimary = 1
    AND k_keyword IN 
        (SELECT k_keyword FROM keywords WHERE keywords.k_spot_no = '${spot_no}')
    AND keywords.k_spot_no != '${spot_no}'
  GROUP BY ratings.spot_no
  LIMIT 0,6`;
}

exports.userReconEstab = (estab_no) => {
  return `SELECT establistments.ec_no, establistments.estab_no, ratings.user_no, 
    establistments.estab_name, establistments_category.ec_name, establistments_photo.image_filename,
    round(SUM(rating_value)/COUNT(*), 2) as RATES
	FROM ratings 
	INNER JOIN establistments ON ratings.estab_no = establistments.estab_no 
	INNER JOIN users ON ratings.user_no = ratings.user_no
	INNER JOIN establistments_category ON establistments_category.ec_no = establistments.ec_no
	INNER JOIN establistments_photo ON establistments_photo.estab_no = establistments.estab_no
    INNER JOIN keywords ON establistments.estab_no = keywords.k_estab_no
	WHERE NOT ratings.estab_no = '${estab_no}'
    AND NOT ratings.estab_no = 0
    AND establistments_photo.image_isprimary = 1
    AND k_keyword IN 
        (SELECT k_keyword FROM keywords WHERE keywords.k_estab_no = '${estab_no}')
    AND keywords.k_estab_no != '${estab_no}'
GROUP BY ratings.estab_no
LIMIT 0,6`;
}

exports.featured = () => {
  return `
  SELECT 
  round(SUM(rating_value)/COUNT(*), 2) as RATES,
  count(ratings.spot_no) as Num_of_Rates,
  spots.spot_no,
  spot_name,
	spots_category.sc_name,
	spots_photo.img_filename
	FROM ratings
	INNER JOIN spots ON ratings.spot_no = spots.spot_no
	INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
    INNER JOIN featured ON ratings.spot_no = featured.spot_no
	INNER JOIN spots_photo ON spots_photo.spot_no = featured.spot_no
	WHERE spots.spot_no = featured.spot_no AND spots_photo.img_isprimary = 1
    GROUP BY spots.spot_no
UNION
SELECT 
round(SUM(rating_value)/COUNT(*), 2) as RATES,
count(ratings.estab_no) as Num_of_Rates,
  establistments.estab_no, 
  estab_name,
	establistments_category.ec_name, 
	establistments_photo.image_isprimary
    FROM ratings
    INNER JOIN establistments ON ratings.estab_no = establistments.estab_no
	INNER JOIN establistments_category ON establistments_category.ec_no = establistments.ec_no
    INNER JOIN featured ON ratings.estab_no = featured.estab_no
	INNER JOIN establistments_photo ON establistments_photo.estab_no = featured.estab_no
	WHERE establistments.estab_no = featured.estab_no AND establistments_photo.image_isprimary = 1
    GROUP BY establistments.estab_no   
    `;
}

exports.tour_query = () => {
  return `SELECT 
  establistments.estab_no,
  estab_name,
  estab_description,
  towns.town_name,
  establistments_photo.image_filename,
  establistments_category.ec_name
  FROM establistments 
  INNER JOIN towns ON establistments.town_no = towns.town_no 
  INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no 
  INNER JOIN establistments_photo ON establistments.estab_no = establistments_photo.estab_no
  INNER JOIN establistments_location ON establistments.estab_no = establistments_location.estab_no
  WHERE ((encode_delete=0 AND encode_inactive=0) AND establistments_photo.image_isprimary=1)
  GROUP BY estab_no
  UNION
  SELECT 
  spots.spot_no,
  spot_name,
  spot_subname,
  spot_description, 
  spots_photo.img_filename,
  spots_category.sc_name
  FROM spots
  INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
  INNER JOIN barangays ON barangays.bar_no = spots.bar_no
  INNER JOIN towns ON towns.town_no = spots.town_no
  INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
  INNER JOIN spots_location ON spots_location.spot_no = spots_location.spot_no
  WHERE spots_photo.img_isprimary=1 
  GROUP BY spot_no`;
}

exports.tour_fetch = (name) => {
  return `SELECT 
  establistments.estab_no,
  estab_name,
  estab_description,
  towns.town_name,
  establistments_photo.image_filename,
  establistments_category.ec_name,
  establistments_location.el_latitude,
  establistments_location.el_lontitude
  FROM establistments 
  INNER JOIN towns ON establistments.town_no = towns.town_no 
  INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no 
  INNER JOIN establistments_photo ON establistments.estab_no = establistments_photo.estab_no
  INNER JOIN establistments_location ON establistments.estab_no = establistments_location.estab_no
  WHERE ((encode_delete=0 AND encode_inactive=0) AND establistments_photo.image_isprimary=1) 
  AND establistments.estab_name = "${name}"
  GROUP BY estab_no
  UNION
  SELECT 
  spots.spot_no,
  spot_name,
  spot_subname,
  spot_description, 
  spots_photo.img_filename,
  spots_category.sc_name,
  spots_location.sl_latitude,
  spots_location.sl_lontitude
  FROM spots
  INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
  INNER JOIN barangays ON barangays.bar_no = spots.bar_no
  INNER JOIN towns ON towns.town_no = spots.town_no
  INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
  INNER JOIN spots_location ON spots_location.spot_no = spots_location.spot_no
  WHERE spots_photo.img_isprimary=1 
  AND spots.spot_name = "${name}"
  GROUP BY spot_no`;
}

exports.notifications = () => {
  return `INSERT INTO notifications (spot_no, estab_no, value, name, action, no_date) VALUES (?,?,?,?,?,?)`;
}

exports.notifications_spots = () => {
  return `SELECT notifications.spot_no, spot_name, value, name, action, no_date
	  FROM notifications
    INNER JOIN spots ON spots.spot_no = notifications.spot_no`;
}

exports.notifications_estab = () => {
  return `SELECT notifications.estab_no, estab_name, value, name, action, no_date
	  FROM notifications
    INNER JOIN establistments ON establistments.estab_no = notifications.estab_no`;
}

exports.keywords_estab = () => {
  return `
  SELECT 
    k_keyword
  FROM keywords 
  WHERE k_estab_no = ?
  `;
}

exports.keywords_spot = () => {
  return `
  SELECT 
    k_keyword
  FROM keywords 
  WHERE k_spot_no = ?
  `;
}