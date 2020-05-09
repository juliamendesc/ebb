const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const bcryptSalt = 10;
const User = require('../models/user.js');
const uploadCloud = require('../config/cloudinary.js');

// GET Routes
router.get('/signup', (req, res, next) => {
    try {
        res.render('auth/signup');
    } catch(e) {
        next(e);
    }
});

router.get('/login', (req, res, next) => {
    try {
        res.render('auth/login');
    } catch(e) {
        next(e);
    }
});

router.get('/logout', (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/login');
    })
});

router.get('/users/:username', (req, res) => {
    const currentUserId = req.session.currentUser._id;  
    User.findById(currentUserId)
        .then(currentUser => {
            console.log('found', currentUser);
            res.render('users', {currentUser});
        })
});


  

// POST Routes
router.post('/login', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.render('auth/login', {
            errorMessage: "Please enter both username and password to login"
        });
        return;
    }

    //check if user exists and if password matches
    User.findOne({'username': username})
    .then(user => {
        if (!user) {
            res.render('auth/login', {
                errorMessage: "Please check your username and password"
            });
            return;
        }
        if (bcrypt.compareSync(password, user.password)) {
            req.session.currentUser = user;
            res.redirect('/');
        } else {
            res.render('auth/login', {
                errorMessage: "Please check your username and password"
            })
        }
    })
});

router.post('/signup', uploadCloud.single('photo'), (req, res, next) => {
    const {username, password, firstName, lastName, dateOfBirth, age, email} = req.body;
    const imgPath = req.file.url;
    const imgName = req.file.originalname;
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);
    
    // Making sure username and password are not empty
    if(username === "" || password === "") {
      res.render("auth/signup", {
        errorMessage: "Indicate a username and password"
      })
      return;
    } 

    // Making sure that user doesn't exist already
    User.findOne({ "username" : username})
    .then(user => {
    if (user) {
        res.render("auth/signup", {
        errorMessage: "The username already exists"
        });
        return;
    }

    User.create({firstName, lastName, dateOfBirth, age, username, password: hashPass, email, imgPath, imgName})
    .then(() => {
        res.redirect('/');
    })
    .catch(error => {
        next(error)
    })
    });
});

 module.exports = router;