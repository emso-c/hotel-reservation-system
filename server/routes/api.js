const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const hotelRouter = require('./hotel');
const roomRouter = require('./room');
const bookingRouter = require('./booking');

// routers are grouped by their logical purpose, not by their path
router.use('/', userRouter)
router.use('/', hotelRouter)
router.use('/', roomRouter)
router.use('/', bookingRouter)

module.exports = router;
