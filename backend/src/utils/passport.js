import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User, { sanitizeUser } from "../models/user.model.js";

// Custom extractor function for extracting JWT from cookies
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["accessToken"];
  }
  return token;
};

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Invalid email or password." });
        }

        const isPasswordMatch = await user.isPasswordCorrect(password);
        if (!isPasswordMatch) {
          return done(null, false, { message: "Invalid email or password." });
        }

        return done(null, sanitizeUser(user));
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    },
    async function (jwt_payload, done) {
      try {
        const user = await User.findById(jwt_payload._id);
        if (user) {
          return done(null, sanitizeUser(user));
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize User
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize User
passport.deserializeUser((user, done) => {
  done(null, user);
});
