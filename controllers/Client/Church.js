const db = require("../../db.js");
var moment = require("moment");
const publicIp = require("public-ip");

let {
  estab_get_all_query,
  estab_get_single,
  comment_query,
  estab_comments
} = require("./Helpers/QueryHelpers");

exports.get_all_Church = (req, res) => {
  db.query(estab_get_all_query(3), (err, rows) => {
    if (err) {
      throw err;
    }
    res.render("Client/Church", {
      rows: rows,
      pageTitle: "Churches in Abra",
      route: "church"
    });
  });
};

exports.church_View = (req, res) => {
  let id = req.params.church_id;
  db.query(estab_get_single(id), (err, rows) => {
    if (err) {
      throw err;
    }
    db.query(estab_comments(id), (error, comments) => {
      if (error) throw error;
      res.render("Client/Church/view", {
        rows: rows,
        moment: moment,
        comments: comments,
        pageTitle: "Church Information",
        route: "church"
      });
    })
  });
};

exports.church_comments = (req, res) => {
  let id = (req.user == undefined) ? "null" : req.user.user_no;
  let data = {
    estab_no: req.params.church_id,
    spot_no: null,
    comm_guest: "yes",
    comm_content: req.body.comment_content,
    comm_email: null,
    comm_ip: null,
    comm_date: moment().format("YYYY-MM-DD HH:MM:SS")
  };

  publicIp.v4().then(ip => {
    db.query(comment_query(id, data.estab_no, data.spot_no, data.comm_guest, data.comm_content, data.comm_email, ip, data.comm_date), (err, rows) => {
      if (err) throw err;
      res.redirect(`/church/${data.estab_no}`);
    });
  });
};