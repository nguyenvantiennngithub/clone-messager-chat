const client = require('./connect.redis');

function connectRedis(){
    client.connect(function(err){
        if (err) throw err
        console.log("Connect success")
    })
}

module.exports = connectRedis
