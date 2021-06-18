var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var bcrypt = require("bcrypt");

var username = "cmps369";
var password = "finalproject";
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        password = hash;
        console.log(password);
    });
});

var app = express();
var indexRouter = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({secret: "cmps369", resave: true,
saveUninitialized: true}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// Set up passport to help with user authentication (guest/password)
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);

passport.use(new LocalStrategy(
  function(user, pswd, done) {
      if ( user != username ) {
          console.log("Username mismatch");
          return done(null, false);
      }

      bcrypt.compare(pswd, password, function(err, isMatch) {
          if (err) return done(err);
          if ( !isMatch ) {
              console.log("Password mismatch");
          }
          else {
              console.log("Valid credentials");
          }
          return done(null, isMatch);
      });
    }
));

passport.serializeUser(function(username, done) {
  done(null, username);
});

passport.deserializeUser(function(username, done) {
  done(null, username);
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

indexRouter.post('/login',
    passport.authenticate('local', { successRedirect: '/contacts',
                                     failureRedirect: '/login_failed',
                                  })
);

module.exports = app;
