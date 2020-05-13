const express = require('express');
const router  = express.Router();

const User = require("../models/user");
const Company = require("../models/company");

/* GET home page. */
router.get('/', (req, res) => {
  const currentUser = req.session.currentUser;
  res.render('index', {currentUser});
});

router.use((req, res, next) => {
  if (req.session.currentUser) {
    next(); //redirects user to the next route
  } else {
    res.redirect('/login');
  }
});

module.exports = router;