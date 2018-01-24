const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_KEY } = require('../../newKeys');

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
        // 10 salt rounds
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

router.post('/login', (req, res, next) => {
  User.find({ email: req.body.email })
    // find() will return an array, findByOne() won't
    .exec()
    .then(user => {
      // check if no user is returned
      if (user.length < 1) {
        // Don't want 404 because it would leave us vulnerable to brute force methods of entry (it would indicate if a provided email is valid)
        // We will just use 404 (unauthorized)
       return res.status(401).json({
        message: 'Auth failed'
       });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err
          });
        } else if (result) {
          // create JWT on successful auth
          const token = jwt.sign({ 
            email: user[0].email,
            userId: user[0]._id
          }, JWT_KEY, {
            expiresIn: '1h'
          });

          return res.status(200).json({
            message: 'Auth successful',
            token
          });
        } else {
          res.status(401).json({
            message: 'Auth failed'
          });
        }
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
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