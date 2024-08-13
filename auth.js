// authentication logic

const jwtSecret = 'my-super-secret-token';

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport');

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // username to encode in JWT
    expiresIn: '7h', // token exp
    algorithm: 'HS256' // used to encode JWT values
  });
}

// login endpoint
// "router" = Express Router object, used to define routes, i.e., POST GET etc.
module.exports = (router) => {
  router.post('/login', (req, res) => {
    // { session false } Passport won't store user info
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON)();
        // shorthand for res.json({ user: user, token: token}), can be done when keys = values
        return res.json({ user, token }); // returned to client for use in subsequent requests
      });
    })(req, res);
  });
}
