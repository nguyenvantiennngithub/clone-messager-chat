
const redis = require('redis')
const client = redis.createClient(process.env.REDIS_TLS_URL, {
	tls: {
		rejectUnauthorized: false
	}	
});

module.exports = client
