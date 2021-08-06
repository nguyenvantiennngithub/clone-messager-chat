
const client = require('./index.redis');

function connectRedis(){
    client.on('connect', function(err){
        if (err) throw err
        console.log("Connect success")
    })
}

module.exports = connectRedis
