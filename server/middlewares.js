const passport = require('passport');
const responses = require('./responses');

function notFound(req, res, next) {
  responses.error(res, 404, 'The requested resource was not found.');
  next();
}
function httpLogger(req, res, next) {
  console.log(`
  [${new Date().toISOString()}] ${req.ip}: ${req.method} ${req.url} ${res.statusCode}
  `);
  next();
}
function protectedRoute(roles) {
  return function(req, res, next) {
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) {
        return responses.error(res, 500, 'Internal Server Error');
      }
      if (!user) {
        if (info.name === 'TokenExpiredError') {
          return responses.error(res, 401, 'Unauthorized', 'Token has expired');
        }
        return responses.error(res, 401, 'Unauthorized', 'Invalid token');
      }

      // Check if user has any of the required roles
      if (!roles.includes(user.role)) {
        return responses.error(res, 403, 'Forbidden', 'Insufficient permissions');
      }

      req.user = user;
      next();
    })(req, res, next);
  };
}

module.exports = {
  notFound,
  httpLogger,
  protectedRoute
};