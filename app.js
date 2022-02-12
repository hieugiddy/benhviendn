var express = require("express");
var config = require("config");
var bodyParser = require("body-parser");
var session = require("express-session");
var path = require('path');
global.appRoot = path.resolve(__dirname);

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.all('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: config.get('secret_key'),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(function (req, res, next) {
  res.locals.messenger = req.session.messenger;
  res.locals.startD = req.session.startD;
  res.locals.endD = req.session.endD;
  next();
});

var controllers = require(__dirname + "/apps/controllers");
app.use(controllers);
app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");
app.use("/static", express.static(__dirname + "/public"));

var host = config.get("server.host");
var port = config.get("server.port");
app.listen(port, host, function () {
  console.log("Server đang chạy tại cổng " + port);
});