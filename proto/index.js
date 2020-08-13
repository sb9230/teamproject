var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);
var port = 3333;
var path = require("path");
var session = require("express-session");
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
var Web3 = require("web3");
var product_contract = require("./contract/contract.js");
var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: "192.168.0.5",
  //host: "localhost",
  port: 3306, // db 포트
  user: "block", // user 이름
  password: "block1234!@", // 비밀번호
  database: "team_project", // database 이름
});

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
var smartcontract = new web3.eth.Contract(
  product_contract.abi,
  product_contract.address
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
