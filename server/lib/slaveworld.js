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
process.on('SIGINT', function() {
    requester.close();
});


var rqu = []; //queue
var rid = 0;  //ids
var request = function(msg, data, callback) {
    rid++;

    var to = setTimeout(function() {
        log("warn", "request "+rid+" timed out");
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
        },

        // ----------

        /*
         Main-Loop, update die Welt
         */
        update: function() {
            var _this = this;

        },

        /*
         Sendet den Status der aktuellen Welt, nur für worldserver
         */
        send: function(data) {},

        /*
         Status der aktuellen Welt wurde empfangen, nur für comserver
         */
        receive: function(data) {


        }
        // ---------
    }

    //mach den _init und gib das objekt aus
    obj._init(worldname);
    return obj;
};