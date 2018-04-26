var express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  User = require("./models/user"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  Strategy = require("passport-steemconnect").Strategy;

passport.use(new LocalStrategy(User.authenticate()));

passport.use(
  new Strategy(
    {
      authorizationURL: `https://steemconnect.com/oauth2/authorize`,
      tokenURL: `https://steemconnect.com/api/oauth2/token`,
      clientID: process.env.clientID,
     clientSecret: process.env.clientSecret,
      callbackURL: `http://localhost:3000/auth/oauth/oauth2/callback`,
      scope: ["vote", "comment"]
    },
    function(accessToken, refreshToken, profile, cb) {
      let userInfo = {
        _id: profile.id,
        username: profile.username,
        password: null,
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile
      };

      User.update({ _id: userInfo._id }, userInfo, { upsert: true }, function(
        err,
        result
      ) {
        err ? console.log(err) : cb(null, profile);
      });
    }
  )
);

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(obj, cb) {
  User.findOne({ _id: obj }, (err, user) => {
    err ? console.log(err) : cb(null, user.profile);
  });
});
/*
mongoose.connect("mongodb://localhost/dpix");
*/
mongoose.connect(
  "mongodb://amethyst:099UCCR69pz@ds213239.mlab.com:13239/dpixify"
);


app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(
  require("express-session")({
    secret: "we are all mad here",
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.static(__dirname + "/public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//============
// ROUTES
//============

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/submit", isLoggedIn, function(req, res) {
  res.render("submit");
});

// AUTH ROUTES
// show sign up form
app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/login/steemconnect", passport.authenticate("steemconnect"));

app.get(
  "/auth/oauth/oauth2/callback",
  passport.authenticate("steemconnect", {
    failureRedirect: "/login"
  }),
  function(req, res) {
    req.flash(
      "success",
      "Successfully Logged In With SteemConnect! Welcome " + req.user.username
    );
    res.redirect("/");
  }
);

// handling user signup
app.post("/register", function(req, res) {
  req.body.username;
  req.body.password;
  var newUser = new User({
    username: req.body.username
  });
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash(
        "success",
        "Successfully Signed Up! Welcome " + req.body.username
      );
      res.redirect("/submit");
    });
  });
});

// LOGIN ROUTES
// render login form
app.get("/login", function(req, res) {
  res.render("login");
});

// login logic
// middleware
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/submit",
    failureRedirect: "/login",
    failureFlash: true
  }),
  function(req, res) {}
);

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function() {
  console.log("dPixify server started.......");
});
