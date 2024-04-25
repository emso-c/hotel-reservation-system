const express = require('express');
const router = express.Router();
const { protectedRoute } = require('../middlewares');

const { createUser, getUserFromToken, updateUser, deleteUser } = require('../controllers/user_controller');  
const { uploadProfilePhoto, deleteProfilePhoto } = require('../storage');


// TODO Delete this route
// router.get('/users', async (req, res) => {
//   const users = await User.find().select('username email role');
//   return responses.json(res, 200, users);
// });
router.post('/users', createUser);
router.get('/user/profile', protectedRoute(['customer', 'hotelOwner']), getUserFromToken);
router.patch('/user/profile', protectedRoute(['customer', 'hotelOwner']), updateUser);
router.delete('/user/profile', protectedRoute(['customer', 'hotelOwner']), deleteUser);
router.put('/user/profile/photo',
  protectedRoute(['customer', 'hotelOwner']),
  uploadProfilePhoto
);
router.delete('/user/profile/photo',
  protectedRoute(['customer', 'hotelOwner']),
  deleteProfilePhoto
);

module.exports = router;