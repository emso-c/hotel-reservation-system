const { User } = require('../models/models');
const responses = require('../responses');
const { encodePassword, comparePasswords } = require('../utils');


async function createUser(req, res) {
  try {
      // Check if request body exists
      if (!req.body) {
          return responses.error(res, 400, 'Bad Request', 'Request body is required');
      }

      // Check if required fields are present in request body
      const fields = ['email', 'password', 'username', 'passwordConfirm', 'role'];
      for (const key of fields) {
          if (!req.body[key]) {
              return responses.error(res, 400, 'Bad Request', `${key} is required`);
          }
      }

      // Check if passwords match
      if (req.body.password !== req.body.passwordConfirm) {
          return responses.error(res, 400, 'Bad Request', 'Passwords do not match');
      }

      // Check if user with the provided email already exists
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
          return responses.error(res, 400, 'Conflict', 'User already exists');
      }
      // Check if role is either customer or hotelOwner
      if (!(req.body.role === 'customer' || req.body.role === 'hotelOwner')) {
        return responses.error(res, 400, 'Bad Request', 'Role must be either customer or hotel owner');
      }

      // Create a new user
      const user = new User({
          email: req.body.email,
          password: encodePassword(req.body.password),
          username: req.body.username,
          role: req.body.role
      });

      await user.save();

      return responses.json(res, 201, { message: 'User created successfully' });
  } catch (error) {
      console.log(error);
      return responses.error(res, 500, 'Internal Server Error');
  }
}

async function updateUser(req, res) {
  if (!req.user) {
    return responses.error(res, 401, 'Unauthorized', 'You are not authorized to access this resource');
  }
  if (!req.body.currPassword) {
    return responses.error(res, 400, 'Bad Request', 'Current password is required');
  }
  if (!req.body) {
    return responses.error(res, 400, 'Bad Request', 'Request body is required');
  }
  // only update provided fields
  const fields = ['email', 'password', 'username'];
  if (!fields.some((field) => req.body[field])) {
    return responses.error(res, 400, 'Bad Request', 'At least one field is required');
  }

  try {
    const user = await User.findById(req.user.sub).exec();
    if (!user) {
      return responses.error(res, 404, 'Not Found', 'User not found');
    }
    // check if current password is correct
    if (!comparePasswords(req.body.currPassword, user.password)) {
      return responses.error(res, 400, 'Bad Request', 'Incorrect password');
    }
    user.email = req.body.email ?? user.email;
    user.password = req.body.password ? encodePassword(req.body.password) : user.password;
    user.username = req.body.username ?? user.username;
    await user.save();
    return responses.json(res, 200, { message: 'User updated successfully', data: user });
  } catch (error) {
    console.log(error);
    return responses.error(res, 500, 'Internal Server Error');
  }
}

async function deleteUser(req, res) {
  if (!req.user) {
    return responses.error(res, 401, 'Unauthorized', 'You are not authorized to access this resource');
  }
  if (!req.body.password) {
    return responses.error(res, 400, 'Bad Request', 'Password is required');
  }
  try {
    const user = await User.findById(req.user.sub).exec();
    if (!user) {
      return responses.error(res, 404, 'Not Found', 'User not found');
    }
    if (!comparePasswords(req.body.password, user.password)){
      return responses.error(res, 401, 'Unauthorized', 'Incorrect password');
    }
    await User.findByIdAndDelete(req.user.sub)
    return responses.json(res, 200, { message: 'User deleted successfully' });
  } catch (error) {
    console.log(error)
    return responses.error(res, 500, 'Internal Server Error');
  }
}


async function getUserFromToken(req, res) {
  if (!req.user) {
      return responses.error(res, 401, 'Unauthorized', 'You are not authorized to access this resource');
  }
  try {
      const user = await User.findById(req.user.sub).select('_id email username role profilePhoto').exec();
      if (!user) {
          return responses.error(res, 404, 'Not Found', 'User not found');
      }
      return responses.json(res, 200, user);
  } catch (error) {
      return responses.error(res, 500, 'Internal Server Error');
  }
}

module.exports = {
  createUser,
  getUserFromToken,
  updateUser,
  deleteUser
};

