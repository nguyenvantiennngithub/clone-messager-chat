const db = require('./connect.db')

function connect(){
    db.getConnection(function(err) {
        if (err) {
            throw err;
        }
        console.log("connect success")
    });

}
  



module.exports = connect