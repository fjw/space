// -----------------------------------
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");
vector = new require( __dirname + "/lib/vector.js")();

var MONGODB = require('mongodb');
var colors  = require('colors');
var _ = require( __dirname + "/lib/lodash.js");
var WORLD = require( __dirname + "/lib/world.js");
// -----------------------------------

var worldname = "testarena";

// -----------------------------------



var server = new MONGODB.Server("127.0.0.1", 27017, {}); //perf: native_parser?


new MONGODB.Db('space', server, {safe: false}).open(function (dberror, db) {

    if (dberror) {
        log("critical", dberror);
    } else {
        log("info", "Connected to DB - World: "+worldname);

        db.on("close", function(error){
            log("info", "DB disconnected.");
        });


        db.collection("world_" + worldname, function(collerror, coll){
            if (collerror) {
                log("critical", collerror);
            } else {

                // Welt erzeugen
                var world = new WORLD(coll, worldname);

                // ------------------------- Main Loop ----------------------------

                setInterval(function() {
                    world.update();
                }, 15);

                /* todo: benchmark dieses fullpower-loop:
                var next = function() {
                    process.nextTick(function () {
                        world.update();
                        next();
                        console.log("loop");
                    });
                };
                next();
                */

                // ----------------------------------------------------------------

            }
        });

    }
});





