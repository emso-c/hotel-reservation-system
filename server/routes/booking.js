const express = require('express');
const router = express.Router();
const { protectedRoute } = require('../middlewares');

const { getAllBookings, getCustomerBookings, getOwnerBookings, createBooking, payBooking, cancelBooking, updateBookingStatus, deleteBooking } = require('../controllers/booking_controller');


// router.get('/all-bookings', getAllBookings); // TODO delete this route
router.get('/bookings/customer', protectedRoute(['customer']), getCustomerBookings);
router.get('/bookings/owner', protectedRoute(['hotelOwner']), getOwnerBookings);
router.post('/booking', protectedRoute(['customer']), createBooking);
router.patch('/booking/:bookingId/pay', protectedRoute(['customer']), payBooking);
router.patch('/booking/:bookingId/cancel', protectedRoute(['customer']), cancelBooking);
router.patch('/booking/:bookingId', protectedRoute(['hotelOwner']), updateBookingStatus); // status query param: approved, rejected
router.delete('/booking/:bookingId', protectedRoute(['customer']), deleteBooking);

module.exports = router;