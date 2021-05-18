const mysql = require('mysql');

//run local
var db = mysql.createConnection({
  host: process.env.HOST || "localhost",
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "",
  database: process.env.DATABASE || "messagers"
});

//run cpanel
// var db = mysql.createConnection({
//   host: "localhost",
//   user: "nveysqehosting_vantiennn",
//   password: "1Ew^^)D_B7_g",
//   database: "nveysqehosting_messager"
// });
module.exports = db
