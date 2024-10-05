import express from "express";
import debug from "debug";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const debugServer = debug("app:sever");
const app = express();
const port = 4000;

// configure passport
passport.use(
  new GoogleStrategy(
    {
      clientID: Process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // method to create or authenticate use in our db
    }
  )
);

// save user into session (cookie)
passport.serializeUser((user, done) => {
  done(null, user);
});

// Retrive user from session (cookie)
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  debugServer(`listening on port : ${port}`);
});
