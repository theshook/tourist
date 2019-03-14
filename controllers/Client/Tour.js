const db = require("../../db.js");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
let {
  tour_query,
  tour_fetch
} = require("./Helpers/QueryHelpers");

exports.tour = (req, res) => {
  let userDetail = req.user || '';
  res.render("Client/Tour", {
    pageTitle: "Tour",
    route: "tour",
    userDetail: userDetail
  });
};

exports.details = (req, res) => {
  let userDetail = req.user || '';
  let days = req.query.days || '';
  let numSelect;
  let firstWord = days.replace(/ .*/, '');

  if (userDetail == '') {
    return res.redirect('/tour')
  }

  if (firstWord == 'One') {
    numSelect = 1;
  } else if (firstWord == 'Two') {
    numSelect = 2;
  } else if (firstWord == 'Three') {
    numSelect = 3;
  }

  db.query(tour_query(), (err, rows) => {
    res.render("Client/Tour/details", {
      pageTitle: "Tour",
      days,
      rows,
      numSelect,
      route: "tour",
      userDetail: userDetail
    });
  });
}

exports.fetch_selected1 = (req, res) => {
  let attraction1 = req.params.attraction1 || '';
  if (attraction1 != '') {
    db.query(tour_fetch(attraction1), (err, result) => {
      if (err) { throw err; }
      res.send(JSON.stringify(result));
    });
  }
};

exports.fetch_selected2 = (req, res) => {
  let attraction2 = req.params.attraction2 || '';

  if (attraction2 != '') {
    db.query(tour_fetch(attraction2), (err, result) => {
      if (err) { throw err; }
      res.send(JSON.stringify(result));
    });
  }
};

exports.fetch_selected3 = (req, res) => {
  let attraction3 = req.params.attraction3 || '';

  if (attraction3 != '') {
    db.query(tour_fetch(attraction3), (err, result) => {
      if (err) { throw err; }
      res.send(JSON.stringify(result));
    });
  }
};

capitalizeFirstLetter = (string) => {
  return string[0].toUpperCase() + string.slice(1);
}

exports.fetch_sendEmail = (req, res) => {
  let { user_fname, user_lname, user_email } = req.user;
  let fullName = capitalizeFirstLetter(user_fname) + " " + capitalizeFirstLetter(user_lname)
  const output = `
  Dear Sir/Madam: <br/>
  Greetings from Abra iTour! <br />
  Please check the details of your itinerary: <br />
  RESERVATION HOLDER: ${fullName}
  ${Object.keys(req.body).map(function (key) {
    return `<li>${req.body[key]}</li>`
  }).join("")}
  We are eagerly anticipating your arrival and would like to advise you of the following in order to help you with your tour. <br />
  This has been a notification that your itinerary is CONFIRMED. Thank You! <br />
  <br />
  <br />
  <br />
  <br />
  Very truly yours, <br />
  Abra iTour Admin

  `;

  // async..await is not allowed in global scope, must use a wrapper
  async function main() {

    let transporter = nodemailer.createTransport(smtpTransport({
      name: "www.bstech-solutions.com",
      host: "mail.bstech-solutions.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      tls: { rejectUnauthorized: false },
      auth: {
        user: "info@bstech-solutions.com", // generated ethereal user
        pass: "market" // generated ethereal password
      }
    }));

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Abra Tourist Guide" <info@bstech-solutions.com>', // sender address
      to: user_email, // list of receivers
      subject: "Welcome to Abra!", // Subject line
      html: output // html body
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.send({ 'msg': 'Email sent to your inbox' })
  }

  main().catch(console.error);
}