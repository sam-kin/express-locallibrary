var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let catalog = require('./routes/catalog');

var app = express();


//mongoDB connection setup
let mongoose = require('mongoose');
let dev_db_uri = 'mongodb+srv://samskin:sams2020@cluster0-4aws9.mongodb.net/express-locallibrary-project?retryWrites=true&w=majority';
let mongoDB = process.env.MONGODB_URI || dev_db_uri;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useFindAndModify: true, useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection Error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalog);

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

// console.log('Server listening on port :' + app.listen(3000).address().port);

module.exports = app;
