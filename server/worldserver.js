// -----------------------------------
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");

var redis = require('redis');
var rc = redis.createClient();

var colors  = require('colors');
var _ = require( __dirname + "/lib/lodash.js");
var WORLD = require( __dirname + "/lib/world.js");
// -----------------------------------

var worldname = "testarena";
var benchmark = false;

// -----------------------------------


rc.on("error", function (err) {
   log("error", "redis: " + err);
});

// -----------------------------------

// Welt erzeugen
var world = new WORLD(rc, worldname, {flush: true});

// ------------------------- Main Loop ----------------------------


//lokaltest
var gamelogic = require(__dirname + "/lib/gamelogic.js");

console.log(gamelogic);






/* //dies ist der richtige loop wieder einkommentieren nach lokaltest
var updatecount = 0;
setInterval(function() {
    world.update();
    if (benchmark) { updatecount++; }
}, 15);

if (benchmark) {
    setupBenchmark(coll);
}
*/



// todo: benchmark dieses fullpower-loop:
// todo: checke andere alternative mit setImmediate
/*
    var next = function() {
        process.nextTick(function () {
            world.update();
            next();
        });
    };
    next();
*/



/*


var updatecount = 0;
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
                    if (benchmark) { updatecount++; }
                }, 15);

                if (benchmark) {
                    setupBenchmark(coll);
                }


                /* todo: benchmark dieses fullpower-loop:
                /* todo: checke andere alternative mit setImmediate
                var next = function() {
                    process.nextTick(function () {
                        world.update();
                        next();
                        console.log("loop");
                    });
                };
                next();
                */

/*

                // ----------------------------------------------------------------

            }
        });

    }
});


function setupBenchmark(coll) {

    var lasttime = process.hrtime();
    setInterval(function() {

        var precision = 3; // 3 decimal places
        var ela = process.hrtime(lasttime);
        var elapsed = ela[0] + ela[1] / 1e9; //in seconds
        var ups = updatecount / elapsed;
        updatecount = 0;
        lasttime = process.hrtime();

        coll.find({type:"player"}).count(function(e1, pcnt) {
            coll.find().count(function(e2, ocnt){
                log("benchmark", ups.toFixed(2) + " updates per second ("+pcnt + " players in " + ocnt + " objects)");
            });
        });



    },5000);

}


function addRandomPlayer(coll) {

    var getRandomNumber = function(min, max) {
        return Math.round(min + (Math.random()*(max-min)));
    };

    coll.insert( {
        type: "player",
        x: getRandomNumber(-1800, 1800),
        y: getRandomNumber(-1800, 1800),      //Koordinaten
        ma: getRandomNumber(0, 359),           //Bewegungswinkel
        s: getRandomNumber(10, 800),            //Speed
        va: getRandomNumber(0, 359),         //Sichtwinkel
        cr: 18,          //Kollisionsradius
        e: 100,          //Energie
        name: "pl" + getRandomNumber(1, 999999),
        shooting: true,
        lturning: true
    });

}

*/