
var cfg = {
    port: 443
};


//---
var http    = require('http'),
    connect = require('connect'),
    express = require('express'),
    app     = express(),
    colors  = require('colors');
//---
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");
_ = require( __dirname + "/lib/underscore.js");
//---


//express config
app.configure('development', function () {
    //static content
    app.use("/",        express.static(__dirname + '/../client/src'));
    cfg.port = 4004;
});


//create servers
log("info", "starting express & socket on port "+cfg.port);
var server = http.createServer(app),
    io = require('socket.io').listen(server);
server.listen(cfg.port);

//socket.io config
io.configure(function(){
    io.set('transports', ['websocket']);
    io.set('log level', 2);
});
io.configure('production', function(){
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file
    io.set('log level', 1);                    // reduce logging
    io.set('transports', [                     // enable all transports (optional if you want flashsocket)
        'websocket'
        ,'flashsocket'
        ,'htmlfile'
        ,'xhr-polling'
        ,'jsonp-polling'
    ]);
});



//------------------------------------------------------------------
//------------------------------------------------------------------

io.of('/play').authorization(function (handshake, callback) {
    // ------------------------------------------------------- MASTER --- Auth

    if((handshake.query.password && handshake.query.password == "trackit") || handshake.address.address == "127.0.0.1") {
        callback(null, true);
    } else {
        callback(null, false);
    }


}).on('connection', function (socket) {
        // ------------------------------------------------------- MASTER --- Connection

        socket.join("room1");


        socket.emit("initial", {whazup:"juhu"});

        socket.on("disconnect", function() {

        });
    });

//------------------------------------------------------------------
//------------------------------------------------------------------
