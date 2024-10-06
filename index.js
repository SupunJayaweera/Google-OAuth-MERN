import express from "express";
import debug from "debug";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ping, getUserById, createUser } from "./databse.js";

const debugServer = debug("app:sever");
const app = express();
const port = 4000;

// configure passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // method to create or authenticate use in our db
      if (await getUserById(profile.id)) {
        debugServer("User already exists in DB");
      } else {
        createUser(profile);
      }
      return done(null, profile);
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

//setup  the session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

//Setup passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

//callback route for google to redirect to
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000/api/profile");
  }
);

// display the user profile
app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(
      `<h1>You are Logged In!</h1><span>${JSON.stringify(
        req.user,
        null,
        2
      )}</span>`
    );
  } else {
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/");
});

// Serve the user profile for the frontend
app.get("/api/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "User is not authenticated" });
  }
});

// Handle logout and clear session
app.get("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: "Logged out successfully" });
  });
});

app.listen(port, () => {
  debugServer(`listening on port : ${port}`);
});
