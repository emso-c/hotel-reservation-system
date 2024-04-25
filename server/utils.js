const bcrypt = require('bcrypt');

function encodePassword(password) {
    return bcrypt.hashSync(password, 10);
}

function comparePasswords(password, hash) {
    return bcrypt.compareSync(password, hash);
}

const generateRandomString = (length) => {
  return Math.random().toString(36).substring(2, length + 2);
};

module.exports = {
    encodePassword,
    comparePasswords,
    generateRandomString,
};