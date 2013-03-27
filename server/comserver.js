// -----------------------------------
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");
vector = new require( __dirname + "/lib/vector.js")();

var MONGODB = require('mongodb');
var colors  = require('colors');
var _ = require( __dirname + "/lib/lodash.js");
var WORLD = require( __dirname + "/lib/world.js");
var USERCONNECTOR = require( __dirname + "/lib/userconnector.js");
// -----------------------------------

var port, env = process.env.NODE_ENV;
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

var dbserver = new MONGODB.Server("127.0.0.1", 27017, {}); //perf: native_parser?
new MONGODB.Db('space', dbserver, {safe: false}).open(function (dberror, db) {

    if (dberror) {
        log("critical", dberror);
    } else {
        log("info", "Connected to DB");

        db.on("close", function(error){
            log("info", "DB disconnected.");
        });

        worldnames.forEach(function(wn) {

            log("info", "loading World '" + wn + "'");
            db.collection("world_" + wn, function(collerror, coll){
                if (collerror) {
                    log("critical", collerror);
                } else {
                    // Welt erzeugen
                    var world = new WORLD(coll, wn);
                    worlds.push(world);
                }
            });

        });

    }
});

// --------------------------------- manage connections -----------------------

new USERCONNECTOR(port, function(c) {

    var updateinterval = null;

    c.on("join", function(worldname) {

        // Welt laden
        var world = _.find(worlds, function(w) { return w.name == worldname; });
        if (world) {

            // Spieler zuerst holen
            world.getPlayer(c.username, function(player) {

                // Spieler spawnen
                if (!player) {
                    world.spawnPlayer(c.username);
                }

                // Begrüßung senden
                c.emit("initial", {
                    playername: c.username,
                    statics: world.statics
                });


                // WeltUpdate-Interval einrichten
                if(updateinterval) { clearInterval(updateinterval);}
                updateinterval = setInterval(function() {

                     world.getVisibleObjects(c.username, function(player, objects) {
                         c.emit("worldupdate", {
                             objects: objects,
                             player: player,
                             clock: Date.now()
                         });
                     });

                }, 14);


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