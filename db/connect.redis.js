
const redis = require('redis')
var client;
if (process.env.REDIS_TLS_URL){
	client = redis.createClient(process.env.REDIS_TLS_URL, {
		tls: {
			rejectUnauthorized: false
		}	
	});
}else{
	client = redis.createClient();
}

module.exports = client
