var env = process.env.NODE_ENV;

if( env == 'production' ) { require('newrelic'); }

// -----------------------------------
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");
vector = new require( __dirname + "/lib/vector.js")();


var servercfg = require( __dirname + "/lib/servercfg.js");
var colors  = require('colors');
var _ = require( __dirname + "/lib/lodash.js");
var WORLD = require( __dirname + "/lib/slaveworld.js");
var USERCONNECTOR = require( __dirname + "/lib/userconnector.js");
// -----------------------------------
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
    var world = new WORLD(wn);

    // anhängen
    worlds.push(world);
});


// --------------------------------- manage connections -----------------------


new USERCONNECTOR(port, function(c, uc) {

    var updateinterval = null;

    c.on("join", function(worldname) {

        // Welt laden
        var world = _.find(worlds, function(w) { return w.name == worldname; });

        if (world && c.logedin) {
            // Spieler ist eingeloggt, Welt ist valide

            // Spieler holen
            world.getPlayer(c.username, function(player) {

                // Spieler spawnen
                if (!player) {
                    world.spawnPlayer(c.username, function(datap) {
                        player = datap;
                    });
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

                     world.getVisibleObjects(c.username, function(objects, player) {

                         c.emit("wu", {
                             objects: objects,
                             player: player
                         });
                     });

                    //Wichtiges Dokument für Network-Com in MP: http://www.gabrielgambetta.com/fpm_live.html

                }, servercfg.updateinterval.comloop);


            });


            c.on("pa", function(data) {
                // Playeraction

                world.setPlayerAction(c.username, data.a, function(nplayer) {
                    c.emit("wpu", { player: nplayer });
                });
            });

            c.on("pi", function() {
                //Ping, sende Pong
                c.emit("po", world.getTime());
            });

            c.on("changeconfig", function(subcfg) {
                if(c.admin) {
                    world.changeWorldConfig(subcfg, function(newcfg) {

                        uc.broadcast("newcfg", {cfg:newcfg});

                    });
                }
            });

        }

    });


    c.onclose = function() {

        // Interval entfernen
        if(updateinterval) {
            clearInterval(updateinterval);
            updateinterval = null;
        }

    };

});
