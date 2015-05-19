#!/bin/env node

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var routes =
{
	passport: require('./routes/passport'),
	authenticated:
	{
		api_profile: require('./routes/api/profile')
	}
};

var sessionMiddleware = session(
{
	secret: 'fg783#$%f',
	store: new MongoStore({
		mongoose_connection:global.nrn.mongoose.connections[0],
		db:global.nrn.mongoose.connection.db
	}),
	resave: true,
	saveUninitialized: true
});

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Passport init
app.use(routes.passport.passport.initialize());
app.use(routes.passport.passport.session());
app.use('/', routes.passport.router);

app.use('/api/*', function(req, res, next)
{
	if(req.user === undefined)
	{
		res.status(401).end();
	} else
	{
		next();
	}
});

// AUTHENTICATED ROUTES
for(var routeName in routes.authenticated)
{
	if(routes.authenticated.hasOwnProperty(routeName))
	{
		app.use('/', routes.authenticated[routeName].router);
	}
}

// catch 404 and forward to error handler
app.use(function(req, res, next)
{
	console.log('Index');
    res.sendfile(__dirname+'/public/index.html');
});

// error handlers

// development error handler
// will print stacktrace
if(app.get('env') === 'development')
{
	app.use(function(err, req, res, next)
	{
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next)
{
	res.status(err.status || 500);
	res.render('error',
	{
		message: err.message,
		error: {}
	});
});


module.exports = app;
