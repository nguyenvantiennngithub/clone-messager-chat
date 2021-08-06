const client = redis.createClient(process.env.REDIS_URL, {
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	pass: process.env.REDIS_PASS
});

module.exports = client

