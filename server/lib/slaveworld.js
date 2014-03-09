var _ = require( __dirname + "/lodash.js");
var zmq = require('zmq');


// ----------------------------------------------
// ---------------------------- private Funktionen
// ----------------------------------------------

var encode = function(objs) {
    return JSON.stringify(objs); //todo: msgpack?
};

var decode = function(ser) {
    return JSON.parse(ser);
};

// Requester vorbereiten
var requester = zmq.socket('req');

var rqu = []; //queue
var rid = 0;  //ids
var request = function(msg, data, callback) {
    rid++;

    var to = setTimeout(function() {
        log("warn", "request "+rid+" ("+msg+") timed out");
        rqu = _.filter(rqu, function(item) { return item.id != rid; });
    }, 2000);

    rqu.push({
        id: rid,
        cb: callback,
        t: to
    });

    requester.send(encode({id:rid, m:msg, d:data}));
};

requester.on('message', function(data) {
    var d = decode(data);
    if (typeof(d.id) != "undefined" &&
        typeof(d.d) != "undefined") {

        var r = _.find(rqu, function(item) { return item.id == d.id; });

        if(r) {
            clearTimeout(r.t);
            rqu = _.filter(rqu, function(item) { return item.id != d.id; });
            r.cb(d.d);
        } else {
            log("warn", "unknown response received");
        }
    } else {
        log("warn", "malformed response received");
    }
});

// subscriber vorbereiten
var subscriber = zmq.socket('sub');

var bc = new (require('events').EventEmitter);

subscriber.subscribe("");

subscriber.on('message', function(data) {
    var d = decode(data);
    bc.emit(d.m, d.d);
});

// Sockets schliessen
process.on('SIGINT', function() {
    requester.close();
    subscriber.close();
    process.exit();
});

// ----------------------------------------------
// ----------------------------- public Objekt
// ----------------------------------------------

exports = module.exports = function(worldname) {
    var obj = {

        // ------------

        name: null,

        // ------------

        statics: [],
        objects: [],
        lastsync: 0,

        cfg: {},

        // -----------

        /*
            Konstruktor & Einstellungen
         */
        _init: function(worldname) {

            this.name = worldname;   //Name der Welt

            //requester verbinden
            requester.connect("ipc://ipc/"+worldname+".ipc");

            request("foo", "foodata", function(data) {
                console.log(data);
            });

            //subscriber verbinden
            subscriber.connect("ipc://ipc/"+worldname+"2.ipc");

            bc.on("hui", function(data) {
                console.log(data);
            });

        },

        // ----------

        /*
            Holt den aktuellen Stand von der masterwelt
        */
        sync: function() {

            request("sync", null, function(data) {
                this.objects = data.objects;
                this.lastsync = data.time;
            });

        }
        // ---------
    }

    //mach den _init und gib das objekt aus
    obj._init(worldname);
    return obj;
};