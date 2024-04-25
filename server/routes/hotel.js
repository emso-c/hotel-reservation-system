const express = require('express');
const router = express.Router();
const { protectedRoute } = require('../middlewares');

const { getHotels, getMyHotels, getHotel, createHotel, updateHotel, deleteHotel, getHotelsWithQuery, updateRating } = require('../controllers/hotel_controller');
const { uploadHotelPhotos, deleteAllHotelPhotos } = require('../storage');


router.get('/hotels', getHotels);
router.get('/hotels/my', protectedRoute(['hotelOwner']), getMyHotels);
router.get('/hotel/search', getHotelsWithQuery);
router.get('/hotel/:hotelId', getHotel);
router.post('/hotel', protectedRoute(['hotelOwner']), createHotel);
router.patch('/hotel/:hotelId/rate', protectedRoute(['customer']), updateRating);
router.patch('/hotel/:hotelId', protectedRoute(['hotelOwner']), updateHotel);
router.delete('/hotel/:hotelId', protectedRoute(['hotelOwner']), deleteHotel);
router.put("/hotel/:hotelId/photos",
  protectedRoute(["hotelOwner"]),
  uploadHotelPhotos
);
router.delete("/hotel/:hotelId/photos",
  protectedRoute(["hotelOwner"]),
  deleteAllHotelPhotos
);

module.exports = router;