const express = require('express');
const db = require('../../db.js');
const bcrypt = require('bcrypt-nodejs');
var moment = require("moment");
const request = require('request');
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");


exports.register_page = (req, res) => {
  res.render("Client/Register/register", { pageTitle: "Login", data: '', error: '', msg: '' });
}

exports.users_create_client = (req, res) => {
  let data = {
    fname: req.body.fname,
    mname: req.body.mname,
    lname: req.body.lname,
    email: req.body.email,
    cm: req.body.cmnumber,
    mobile: req.body.mnumber,
    cp: req.body.cpnumber,
    phone: req.body.pnumber,
    username: req.body.email,
    password: bcrypt.hashSync(req.body.password, null, null),
    usertype: 1
  };

  if (
    req.body.captcha === undefined ||
    req.body.captcha === '' ||
    req.body.captcha === null
  ) {
    return res.json({ "success": false, "msg": "Please select captcha", error: '' });
  }

  // Secret Key
  const secretKey = '6LcBjJMUAAAAAPXrrdcv_4tWc2EJJB7zv3DseKHd';

  // Verify URL
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;


  // Make Request To VerifyURL
  request(verifyUrl, (err, response, body) => {
    body = JSON.parse(body);

    // If Not Successful
    if (body.success !== undefined && !body.success) {
      return res.json({ "success": false, "msg": "Failed captcha verification" });
    }

    //If Successful
    db.query(`SELECT * FROM users WHERE user_email = ?`, [data.email], (val_err, val_res) => {
      if (val_err) { throw val_err; }

      if (val_res.length >= 1) {

        return res.json({ msg: '', error: 'Email already exists.' });

      } else {

        db.query('INSERT INTO users(ut_no, user_lname, user_fname, user_mname, user_email,  user_mobile, user_phone, user_encode_date) values(?,?,?,?,?,?,?,?)',
          [data.usertype, data.lname, data.fname, data.mname, data.email, data.cm + data.mobile, data.cp + data.phone, moment().format("YYYY-MM-DD HH:MM:SS")],
          (err, rows) => {

            if (err) { throw err; }

            db.query('INSERT INTO logins(user_no, login_uname, login_pword, login_inactive) values(?,?,?,1)',
              [rows.insertId, data.username, data.password], (error, result) => {
                if (error) { throw error; }

                sendEmail(data.username, res);
              });
          });
      }
    });
  });
}

exports.users_verify_email = (req, res) => {
  let email = req.params.user_email;
  db.query('SELECT * FROM logins WHERE login_uname = ?', [email], (err, rows) => {
    if (err) { throw err; }

    if (rows.length == 1) {

      req.session.verified = 'Email has been verified you may login now!';

      db.query('UPDATE logins SET login_inactive = 0 WHERE login_uname = ?', [email], (up_err, up_rows) => {
        if (up_err) { throw up_err; }

        res.redirect('/login');
      });
    }
  });
}

sendEmail = (username, res) => {
  const output = `
                Good day your destination in Abra are the following:
                <br />
                Before you get started, we just need to be sure this is the right email address.
                Accuracy is kind of our thing.

                <a href="localhost:8080/register/verify/${username}">Verify Now</a>
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

    return res.json({ created: 'Verify your email and login now!', msg: '', error: '' })
  }

  main().catch(console.error);
}

