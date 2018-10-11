// ESTABLISHMENTS QUERY
exports.estab_get_all_query = ec_no => {
  return `SELECT 
  establistments.estab_no,
  estab_name,
  estab_description,
  towns.town_name,
  establistments_photo.image_filename
  FROM establistments 
  INNER JOIN towns ON establistments.town_no = towns.town_no 
  INNER JOIN establistments_category ON establistments.ec_no = establistments_category.ec_no 
  INNER JOIN establistments_photo ON establistments.estab_no = establistments_photo.estab_no
  WHERE (encode_delete=0 AND encode_inactive=0) AND 
  establistments.ec_no=${ec_no} AND establistments_photo.image_isprimary=1
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
  spots_photo.img_filename
  FROM spots
  INNER JOIN spots_category ON spots_category.sc_no = spots.sc_no
  INNER JOIN barangays ON barangays.bar_no = spots.bar_no
  INNER JOIN towns ON towns.town_no = spots.town_no
  INNER JOIN spots_photo ON spots_photo.spot_no = spots.spot_no
  WHERE spots_photo.img_isprimary=1 AND
	spots.sc_no=${sc_no}`;
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
