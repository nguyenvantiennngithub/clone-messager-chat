const mysql = require('mysql');

//run local
var db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "messagers",
});
console.log({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "messagers",
})
//run cpanel
// var db = mysql.createConnection({
//   host: "localhost",
//   user: "nveysqehosting_vantiennn",
//   password: "1Ew^^)D_B7_g",
//   database: "nveysqehosting_messager"
// });
module.exports = db
