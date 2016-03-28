
'use strict';

// Libraries
const Hapi      = require('hapi')
const Aguid     = require('aguid');
const Boom      = require('boom');
const Jwt       = require('jsonwebtoken');
const Mongoose  = require('mongoose');
const Redis     = require('redis');
const SocketIO  = require('socket.io')

// Extras
const Env       = require('./env.json');
const Plugins   = require('./plugins')

// Variables
const Host          = process.env.HOST || Env.host
const JwtSecret     = process.env.JWT_SECRET || Env.jwt_secret;
const MongoUri      = process.env.MONGO_URI || Env.mongo_uri;
const NodeEnv       = process.env.NODE_ENV || Env.node_env;
const Port          = process.env.PORT || Env.port
const RedisHost     = process.env.REDIS_PORT_6379_TCP_ADDR || Env.redis_host;
const RedisPort     = process.env.REDIS_PORT_6379_TCP_PORT || Env.redis_port;

// Server connection
var server = new Hapi.Server();
server.connection({
    host: Host,
    port: Port,
    routes: {
        cors: true
    }
});

// Mongo connection
Mongoose.connect(MongoUri, function(err) {
    if (err) {
        server.log('error', {env: NodeEnv, message: err.message});
    } else {
        server.log('info', {env: NodeEnv, message: "MongoDB connected: " + MongoUri})
    }
});

// Redis connection
var redisClient = Redis.createClient(RedisPort, RedisHost);
redisClient.set('redis', 'working');
redisClient.get('redis', function (rediserror, reply) {
    if(rediserror) {
        server.log('error', {env:NodeEnv, message:rediserror});
    }

    server.log('info', {env:NodeEnv, message:"Redis connection: " + reply.toString()});
});

// Redis function validation
var validate = function (decoded, request, callback) {
    redisClient.get(decoded.id, function (rediserror, reply) {
        if(rediserror) {
          server.log('error', {env:NodeEnv, message:rediserror});
        }

        var session;

        if(reply) {
          session = JSON.parse(reply);
        } else {
          return callback(rediserror, false);
        }

        if (session.valid === true) {
          return callback(rediserror, true);
        } else {
          return callback(rediserror, false);
        }
    });
};

// Socket IO
var io = SocketIO(server.listener);

// Routes
server.route([
    {
        method: 'GET',
        path: '/',
        handler: function(request, reply) {
            reply({env: NodeEnv, message: Env.project});
        }
    }
]);

// Load plugins
server.register(Plugins);

// Start server
server.start((err) => {
    if (err) {
        throw err;
    }

    server.log('info', {env: NodeEnv, message: 'Server running: ' + server.info.uri});
})
