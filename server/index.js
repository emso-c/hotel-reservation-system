require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { notFound, httpLogger } = require('./middlewares');

const app = express();
const port = process.env.PORT || 5000;

// Database connection
mongoose
.connect(process.env.CONN_STRING)
.then(() => console.log(`Database connected successfully`))
.catch((err) => console.log(err));
mongoose.Promise = global.Promise; // Since mongoose's Promise is deprecated, we override it with Node's Promise

// Passport configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};
passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
  if (jwtPayload.sub) {
    return done(null, jwtPayload);
  }
  return done(null, false);
}));

// Routes
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');


// Register middlewares and routes
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use('/cdn', express.static('cdn'));
app.use(passport.initialize());
app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use(notFound);
app.use(httpLogger);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
