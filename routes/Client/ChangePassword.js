const express = require("express");
const db = require("../../db");
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');

router.post('/', (req, res) => {
  let { login_no, user_no, login_pword } = req.user;
  const { oldPassword, inputPassword } = req.body;

  if (!bcrypt.compareSync(oldPassword, login_pword))
    return res.json({ error: true, err_msg: 'Incorrect old password' })

  db.query(`UPDATE logins SET login_pword = ? WHERE login_no = ? and user_no = ?`,
    [bcrypt.hashSync(inputPassword, null, null), login_no, user_no],
    (err, row) => {
      if (err) { return res.json({ error: true, err_msg: 'Ooopsss.. Something went wrong!' }) }

      return res.json({
        error: false,
        err_msg: '',
        success: true,
        success_msg: 'Password successfully updated.'
      });
    });
});

module.exports = router;