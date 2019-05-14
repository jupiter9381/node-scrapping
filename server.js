const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
var mysql = require('mysql');
var keypress = require('keypress');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "autoline"
});

const crons = require("./controller/crons");

const app = express();

// Bodyparser Middleware
app.use(bodyParser.json());

keypress(process.stdin);

crons.prepareCron(con);
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('keypress', function (ch, key) {
  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  }
  
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server started on port " + port));
