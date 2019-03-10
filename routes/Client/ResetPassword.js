const express = require("express");
const db = require("../../db");
const router = express.Router();
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
let moment = require("moment");
const bcrypt = require('bcrypt-nodejs');

router.get("/", (req, res) => {
  let message = req.session.valid != '' ? req.session.valid : '';
  let success = req.session.success != '' ? req.session.success : '';

  if (req.user) {
    res.redirect('/');
  } else {
    res.render("Client/Reset Password", {
      pageTitle: "Reset Password",
      message,
      success
    });
  }

});

router.post("/", (req, res) => {
  let data = req.body;

  db.query(`SELECT count(user_email) AS count_email, users.user_no AS user_id FROM users
	INNER JOIN logins ON
  users.user_no = logins.user_no
  WHERE user_email = ? AND 
  user_mobile = ? AND 
  user_phone = ?`, [data.username, data.cmnumber + data.mnumber, data.cpnumber + data.pnumber], (err, rows) => {

      if (rows[0].count_email <= 0) {
        req.session.valid = "Email/Mobile Number/Phone Number is not valid.";
        return res.redirect('/reset');
      }

      require('crypto').randomBytes(48, function (err, buffer) {
        var token = buffer.toString('hex');

        db.query(`UPDATE logins
      SET resetPasswordToken = ?,
      resetPasswordExpires = ?
      WHERE login_uname = ? and user_no = ?`, [
            token,
            moment().add(1, 'h').format(), // 1 hour
            data.username,
            rows[0].user_id
          ], (ex_err, ex_rows) => {
            sendEmail(data.username, token, req, res);
          });
      });
    });
});

router.get("/:email/:token", (req, res) => {

  db.query(`SELECT count(login_uname) as username FROM logins 
  WHERE resetPasswordToken = ? AND login_uname = ?`,
    [req.params.token, req.params.email], (err, rows) => {
      if (rows[0].username <= 0) {
        return res.render('Client/Reset Password/error', {
          pageTitle: "Reset Password",
          message: 'Invalid email/token',
          jum: 'Invlaid email/token',
          success: undefined
        });
      }
      db.query(`SELECT count(login_uname) as username FROM logins 
      WHERE resetPasswordToken = ? AND login_uname = ? AND resetPasswordExpires <= ?`,
        [req.params.token, req.params.email, moment().format("YYYY-MM-DD HH:mm:ss")], (err, rows) => {
          console.log(rows[0].username)
          if (rows[0].username == 1) {
            return res.render('Client/Reset Password/error', {
              pageTitle: "Reset Password",
              message: 'Reset Token Expired. Request a new one.',
              jum: 'Token has expired.',
              success: undefined
            });
          }
          return res.render('Client/Reset Password/reset', {
            pageTitle: "Reset Password",
            email: req.params.email,
            token: req.params.token,
            message: undefined,
            success: undefined
          });
        });
    });
});

router.post("/:email/:token", (req, res) => {
  db.query(`UPDATE logins
      SET login_pword = ?, resetPasswordExpires = ? WHERE resetPasswordToken = ? and login_uname = ?`,
    [bcrypt.hashSync(req.body.password, null, null), '', req.params.token, req.params.email],
    (err, rows) => {
      if (err) { throw err; }
      return res.render('Client/Reset Password/reset', {
        pageTitle: "Reset Password",
        email: req.params.email,
        token: req.params.token,
        message: undefined,
        success: 'Password successfully change! click <a href="http://localhost:8080/login" class="btn btn-info">here</a> to login.'
      });
    });
});

sendEmail = (username, token, req, res) => {
  const output = `
                We notice that you've requested to reset your password.
                You must reset your password within an hour.
                <br>
                Click here! 
                <a href="http://localhost:8080/reset/${username}/${token}">Create New Password</a>
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
      to: username, // list of receivers
      subject: "Welcome to Abra!", // Subject line
      html: output // html body
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    req.session.success = "We've send the link to reset your password, check your email.";
    req.session.valid = undefined;
    return res.redirect('/reset');
  }

  main().catch(console.error);
}

module.exports = router;
