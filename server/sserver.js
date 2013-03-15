
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
WORLD = require( __dirname + "/lib/world.js");
//---


//express config
app.configure('development', function () {
    //static content
    app.use("/",        express.static(__dirname + '/../client/src'));
    cfg.port = 4004;
    log("info", "starting dev");
});

app.configure('production', function () {
    //static content
    app.use("/",        express.static(__dirname + '/../client/build'));
    cfg.port = 443;
    log("info", "starting prod");
});


//create servers
log("info", "starting express & socket on port "+cfg.port);
var server = http.createServer(app);
var io = require('socket.io').listen(server);
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




var world = new WORLD();


var worldfunctionsstring = "";
require("fs").readFile(__dirname + "/lib/worldfunctions.js", "utf8", function(err, data) {
    worldfunctionsstring = data.match(/\/\/\/\/([\s\S]*)\/\/\/\//)[1];
});




//------------------------------------------------------------------
//------------------------------------------------------------------

io.of('/play').authorization(function (handshake, callback) {
    // ------------------------------------------------------- play --- Auth

    var username = handshake.query.user;
    var password = handshake.query.password;

    if (handshake.address.address == "127.0.0.1" || handshake.address.address == "192.168.178.20") {
        username = "developer"; password = "s";
    }


    if((username && password && password == "s")) {
        handshake.playername = username;

        callback(null, true);
    } else {
        callback(null, false);
    }


}).on('connection', function (socket) {
    // ------------------------------------------------------- play --- Connection

    var playername = socket.handshake.playername;

    socket.join("myworld");

    // Daten holen / erzeugen
    var player =  _.find(world.objects, function(obj) { return obj.type == "player" && obj.name == playername; });
    if(!player) {
        //erzeuge neuen Spieler
        player = world.spawnPlayer(playername);
    }


    // Begrüßung senden
    socket.emit("initial", {
        playername: playername,
        worldfunctions: worldfunctionsstring,
        statics: world.statics
    });

    // World-Update-Interval einrichten
    var statusinterval = setInterval(function() {

        //finde player falls er nichtmehr da ist
        if(player.deleted) {
            player =  _.find(world.objects, function(obj) { return obj.type == "player" && obj.name == playername && !obj.deleted; });
        }

        // sende Update
        socket.volatile.emit("worldupdate",
            {
                objects: world.objects,
                player: player,
                clock: Date.now()
            });
    }, 14);

    // Player-Events
    socket.on("thrust", function(msg) {
        if(msg == "start") { player.thrusting = true; }
        else { player.thrusting = false; }
    });

    socket.on("break", function(msg) {
        if(msg == "start") { player.breaking = true; }
        else { player.breaking = false; }
    });

    socket.on("tright", function(msg) {
        if(msg == "start") { player.rturning = true; }
        else { player.rturning = false; }
    });

    socket.on("tleft", function(msg) {
        if(msg == "start") { player.lturning = true; }
        else { player.lturning = false; }
    });

    socket.on("breaktostop", function(msg) {
        if(msg == "start") { player.breakingtostop = true; }
        else { player.breakingtostop = false; }
    });

    socket.on("shoot", function(msg) {
        if(msg == "start") { player.shooting = true; }
        else { player.shooting = false; }
    });

    socket.on("shoot2", function(msg) {
        if(msg == "start") { player.shooting2 = true; }
        else { player.shooting2 = false; }
    });

    socket.on("allsystems", function(msg) {
        if(msg == "stop") {
            player.thrusting = false;
            player.breaking = false;
            player.rturning = false;
            player.lturning = false;
            player.breakingtostop = false;
            player.shooting = false;
            player.shooting2 = false;
        }
    });


    socket.on("test", function(msg) {
        if(msg == "start") {


            player.exploding = true;



        }
        else {
            //player.exploding = false;
        }
    });


    // Connection-Events
    socket.on("disconnect", function() {
        clearInterval(statusinterval);
    });

});
//------------------------------------------------------------------
//------------------------------------------------------------------


io.of('/admin').authorization(function (handshake, callback) {
    // ------------------------------------------------------- play --- Auth

    if((handshake.query.password && handshake.query.password == "a") || handshake.address.address == "127.0.0.1") {
        callback(null, true);
    } else {
        callback(null, false);
    }


}).on('connection', function (socket) {
        // ------------------------------------------------------- play --- Connection

        socket.join("myworld");

        // Begrüßung senden
        socket.emit("initial", {
            worldfunctions: worldfunctionsstring,
            statics: world.statics
        });

    });
//------------------------------------------------------------------
//------------------------------------------------------------------


setInterval(function() {
    world.update();
},10);

