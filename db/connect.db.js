const mysql = require('mysql');

//run local
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "messagers"
});

//run cpanel
// var db = mysql.createConnection({
//   host: "localhost",
//   user: "nveysqehosting_vantiennn",
//   password: "1Ew^^)D_B7_g",
//   database: "nveysqehosting_messager"
// });
module.exports = db
