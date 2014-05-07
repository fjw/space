var _ = require( __dirname + "/lodash.js");
var zmq = require('zmq');


// ----------------------------------------------
// ---------------------------- private Funktionen
// ----------------------------------------------

var servertimediff = 0;
var getTime = function() { // holt die aktuelle Zeit der Welt in ms
    return Date.now() - servertimediff;
};

var encode = function(objs) {
    return JSON.stringify(objs);
};

var decode = function(ser) {
    return JSON.parse(ser);
};

// Requester vorbereiten

var timeouttime = 2000;
var retrytime = 4000;

var requester = zmq.socket('req');

var rqu = []; //queue
var rid = 0;  //ids
var request = function(msg, data, callback) {
    rid++;

    var to = setTimeout(function() {
        log("warn", "request "+rid+" ("+msg+") timed out");
        rqu = _.filter(rqu, function(item) { return item.id != rid; });
    }, timeouttime);

    rqu.push({
        id: rid,
        cb: callback,
        t: to
    });

    requester.send(encode({id:rid, m:msg, d:data}));
};

var requestReliable = function(msg, data, callback) {

    var retryTimeOut;
    var tryrequest = function() {

        clearTimeout(retryTimeOut);
        retryTimeOut = setTimeout(function(){

            log("warn", "retrying request...");
            tryrequest();

        }, retrytime);

        request(msg, data, function(answer) {
            clearTimeout(retryTimeOut);
            callback(answer);
        });
    };

    tryrequest();
};



requester.on('message', function(data) {
    var d = decode(data);
    if (typeof(d.id) != "undefined" &&
        typeof(d.d) != "undefined") {

        var r = _.find(rqu, function(item) { return item.id == d.id; });

        if(r) {
            clearTimeout(r.t);
            rqu = _.filter(rqu, function(item) { return item.id != d.id; });
            if(typeof(r.cb) == "function") {
                r.cb(d.d);
            }
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
            var _this = this;

            this.name = worldname;   //Name der Welt

            //requester verbinden
            requester.connect("ipc://ipc/"+worldname+"_reqrep.ipc");

            //subscriber verbinden
            subscriber.connect("ipc://ipc/"+worldname+"_pubsub.ipc");


            // Hole initial die Daten
            requestReliable("getstaticdata", null, function(data) {
                _this.cfg = data.cfg;
                _this.statics = data.statics;
                servertimediff = 0;
                servertimediff = getTime() - data.mastertime; // hier auch ein timesync
                log("info", "got "+_this.statics.length+" statics from world");
            });

            // Timesync
            bc.on("timesync", function(data) {
                servertimediff = 0;
                servertimediff = getTime() - data.mastertime;
            });


        },

        // ----------

        /*
            Holt den aktuellen Stand von der masterwelt
        */
        sync: function(callback) {
            var _this = this;

            request("getobjects", null, function(data) {
                _this.objects = data.objects;
                _this.lastsync = data.time;

                callback();
            });

        },
        // ---------

        getPlayer: function(playername, callback) {
            var _this = this;

            this.sync(function() {
                callback(_.find(_this.objects, function(item){ return (item.type == "player" && item.name == playername); }));
            });
        },

        spawnPlayer: function(playername, callback) {

            request("spawnplayer", { name:playername }, function(data) {
                callback(data.player);
            });

        },

        getVisibleObjects: function(playername, callback) {
            var _this = this;

            this.sync(function() {
                callback(_this.objects, _.find(_this.objects, function(item){ return (item.type == "player" && item.name == playername); }));
            });
        },

        getTime: function() {

            return getTime();
        },

        setPlayerAction: function(playername, action, callback) {

            request("setplayeraction", { name: playername, action: action }, function(data) {
                callback(data.player);
            });

        },

        changeWorldConfig: function(subcfg, callback) {
            var _this = this;

            //setzt eine neue config für diese Welt (adminfunktion)
            request("setcfg", { subcfg: subcfg }, function(data) {
                _this.cfg = data.cfg;
                callback(data.cfg);
            });

        }

    };

    //mach den _init und gib das objekt aus
    obj._init(worldname);
    return obj;
};