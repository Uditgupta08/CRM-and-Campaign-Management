const redis = require("redis");

const publisher = redis.createClient();
const subscriber = redis.createClient();

publisher.connect();
subscriber.connect();

module.exports = { publisher, subscriber };
