
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');
const { user } = require('../models/index');


module.exports.applystrategy = (passport, vv, ff) => {

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET_KEY 
  };

  passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    // console.log('JWT payload:', jwt_payload);
    try {
      const users = await user.findById(jwt_payload.id);
      if (users) {
        return done(null, users);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  }));
}


