const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
  // first we check if the email input is of an existing user
  // Note: exec() returns a promise
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        // 409 means conflict
        return res.status(409).json({
          message: 'Email exists'
        })
      } else {
        // if not, only then do we hash the password and create a new user
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            user.save().then(data => {
              console.log(data);
              res.status(201).json({
                message: 'user created'
              })
            }).catch(err => {
              console.log(err);
              res.status(500).json({
                error: err
              })
            })
          }
        })  
      }
    })
});

router.delete('/:userId', (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(data => {
      res.status(200).json({
        message: 'user deleted'
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
});

module.exports = router;