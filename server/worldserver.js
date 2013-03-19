// -----------------------------------
var mongodb = require('mongodb');
var colors  = require('colors');
var log = require( __dirname + "/lib/log.js");
var oi = require( __dirname + "/lib/oi.js");
var _ = require( __dirname + "/lib/lodash.js");
var WORLD = require( __dirname + "/lib/world.js");
// -----------------------------------

var worldname = "testarena";

// -----------------------------------



var server = new mongodb.Server("127.0.0.1", 27017, {}); //perf: native_parser?


new mongodb.Db('space', server, {safe: false}).open(function (dberror, db) {

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
                while(1) {
                    process.nextTick(function () {
                        world.update();
                    });
                }
                // ----------------------------------------------------------------

            }
        });

    }
});





