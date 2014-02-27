var env = process.env.NODE_ENV;

if( env == 'production' ) { require('newrelic'); }

// -----------------------------------
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");
vector = new require( __dirname + "/lib/vector.js")();

var redis = require('redis');
var rc = redis.createClient();

var colors  = require('colors');
var _ = require( __dirname + "/lib/lodash.js");
var WORLD = require( __dirname + "/lib/world.js");
var USERCONNECTOR = require( __dirname + "/lib/userconnector.js");
// -----------------------------------

rc.on("error", function (err) {
    log("error", "redis: " + err);
});

// -----------------------------------

var port;
if( env == 'production' ) {

    // ---- production-config
    port = 443;

} else {

    // ---- development-config
    port = 4004;
    env = "development";
}

log("info", "[" + env + "] communication-server listening on " + port);


// --------------------------------- manage worlds -----------------------

var worldnames = ["testarena"];
var worlds = [];

worldnames.forEach(function(wn) {

    log("info", "loading World '" + wn + "'");
    // Welt erzeugen
    worlds.push(new WORLD(rc, wn));

});


// --------------------------------- manage connections -----------------------

new USERCONNECTOR(port, function(c) {

    var updateinterval = null;

    c.on("join", function(worldname) {

        // Welt laden
        var world = _.find(worlds, function(w) { return w.name == worldname; });
        if (world && c.logedin) {

            // Spieler zuerst holen
            world.getPlayer(c.username, function(player) {

                // Spieler spawnen
                if (!player) {
                    world.spawnPlayer(c.username);
                }

                // Begrüßung senden
                c.emit("ini", {
                    playername: c.username,
                    statics: world.statics,
                    cfg: world.cfg
                });

                // Updateinterval Welt an Spieler
                if(updateinterval) { clearInterval(updateinterval);}
                updateinterval = setInterval(function() {

                     world.getVisibleObjects(c.username, function(player, objects) {
                         c.emit("wu", {
                             objects: objects,
                             player: player
                         });
                     });

                    //Wichtiges Dokument für Network-Com in MP: http://www.gabrielgambetta.com/fpm_live.html


                }, 45);


            });


            c.on("pa", function(action) {
                // Playeraction
                world.setPlayerAction(c.username, action);
            });

            c.on("pi", function(datenow) {
                //Ping, sende Pong
                c.emit("po", Date.now());
            });
        }

    });


    c.onclose = function(code, message) {

        // Interval entfernen
        if(updateinterval) {
            clearInterval(updateinterval);
            updateinterval = null;
        }

    };

});