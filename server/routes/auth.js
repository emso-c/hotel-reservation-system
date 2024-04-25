const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');
const responses = require('../responses');
const { comparePasswords } = require('../utils');

const router = express.Router();

// single endpoint, no controller needed
router.post('/getAccessToken', function(req, res) {
  if (!req.body.username || !req.body.password) {
    return responses.error(res, 400, 'Bad Request', 'Username and email are required');
  }
  User.findOne({ username: req.body.username })
    .then(user => {
      if (!user) {
        return responses.error(res, 404, 'Not Found', 'User not found');
      }
      if (!comparePasswords(req.body.password, user.password)) {
        return responses.error(res, 400, 'Bad Request', 'Incorrect password');
      }
      user = {
        sub: user._id,
        username: user.username,
        role: user.role,
        profilePhoto: user.profilePhoto || 'default.jpg'
      }
      const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
      // const refreshToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
      // res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', secure: true, maxAge: process.env.REFRESH_TOKEN_EXPIRY });
      return responses.json(res, 200, { token: accessToken });
    })
    .catch(err => {
      console.log(err);
      return responses.error(res, 500, 'Internal Server Error');
    });
});


// router.post('/refreshAccessToken', function(req, res) {
//   if (!req.cookies.refreshToken) {
//     return responses.error(res, 400, 'Bad Request', 'Refresh token is required');
//   }
//   jwt.verify(req.cookies.refreshToken, process.env.JWT_SECRET, function(err, user) {
//     if (err) {
//       return responses.error(res, 401, 'Unauthorized', 'Invalid token');
//     }
//     const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
//     return responses.json(res, 200, { token: accessToken });
//   });
// });



module.exports = router;