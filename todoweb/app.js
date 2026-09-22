var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
var session = require('express-session');
var flash = require('connect-flash');
const { MongoClient } = require('mongodb');

const pg = require('pg') 
const { Pool } = pg
 
const pool = new Pool({
  user: 'ariq',
  password: '12345',
  host: 'localhost',
  port: 5432,
  database: 'datadb'
})

async function main() {
  const url = 'mongodb://localhost:27017';
  const client = new MongoClient(url);
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db("breadsdb");

  return db;
}

main().then((db)=> {
var usersRouter = require('./routes/users');
var todosRouter = require('./routes/todos');
var todosApiRouter = require('./routes/api/todos')(db);
var usersApiRouter = require('./routes/api/users')(db);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({
  secret: 'Rubicamp',
  resave: false,
  saveUninitialized: false
}))
app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next(); 
});


app.use('/users', usersRouter);
app.use('/todos', todosRouter);
app.use('/api/todos', todosApiRouter);
app.use('/api/users', usersApiRouter);

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


/**
 * Module dependencies.
 */

var debug = require('debug')('todoweb:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

}).catch(e => console.log(e));
