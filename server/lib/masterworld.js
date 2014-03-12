var _ = require( __dirname + "/lodash.js");
var gl = require( __dirname + "/gamelogic.js");
var zmq = require('zmq');


// ----------------------------------------------
// ---------------------------- private Funktionen
// ----------------------------------------------

var starttime = 0;
var getTime = function() { // holt die aktuelle Zeit der Welt in ms, auf 4 Nachkommastellen genau
    var t = process.hrtime();
    var tt = ((t[0] * 1e9 + t[1]) / 1e6) - starttime;
    return ((tt * 1e4)|0)/1e4;
};

var lasttime = 0;

// ---

var encode = function(objs) {
    return JSON.stringify(objs); //todo: msgpack?
};

var decode = function(ser) {
    return JSON.parse(ser);
};

// ---

// Verbindung einrichten
var responder = zmq.socket('rep');
var req = new (require('events').EventEmitter);
var publisher = zmq.socket('pub');

var publish = function(msg, data) {
    publisher.send(encode({m:msg, d:data}));
};

// Sockets schliessen
process.on('SIGINT', function() {
    responder.close();
    publisher.close();
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
        astack: {},
        cfg: {},

        // -----------

        /*
            Konstruktor & Einstellungen
         */
        _init: function(worldname) {
            var _this = this;

            this.name = worldname;   //Name der Welt

            // Einstellungen holen! Map-Einstellungen überschreiben globale //todo: stimmt dieser Kommentar? Bestimmt! Trotzdem nochmal prüfen
            var map = require( __dirname + "/../maps/"+worldname+".js");  // Map-Einstellungen
            this.cfg = _.extend(require( __dirname + "/../maps/globalcfg.js"), map.cfg); // globale einstellungen

            this._loadStatics(map);

            // Weltzeit initial setzen
            starttime = getTime();

            // Pubisher verbinden
            publisher.bindSync("ipc://ipc/"+worldname+"2.ipc");

            // Responder verbinden
            responder.bind("ipc://ipc/"+worldname+".ipc", function(err) {
                if (err) throw err;

                responder.on('message', function(data) {

                    var d = decode(data);

                    var respond = function(msg) {
                        responder.send(encode({id: d.id, d: msg}));
                    };

                    req.emit(d.m, d.d, respond);
                });
            });

            // Responder Events
            req.on("getobjects", function(data, respond) {
                respond({ objects: _this.objects, time: getTime() });
            });

            req.on("getstaticdata", function(data, respond) {
                respond({ statics: _this.statics, cfg: _this.cfg, mastertime: getTime()});
            });

            req.on("spawnplayer", function(data, respond) {
                respond({ player: _this.spawnPlayer(data.name) });
            });

            req.on("setplayeraction", function(data, respond) {
                _this.setPlayerAction(data.name, data.action, data.actiontime);
                respond(null);
            });

            // Masterzeit initial und regelmässig synchen
            publish("timesync", {mastertime: getTime()});
            setInterval(function(){
                publish("timesync", {mastertime: getTime()});
            }, 10000);


        },

        // ----------

        /*
            Main-Loop, update die Welt
         */
        update: function() {
            var _this = this;

            // aktuelle Zeit
            var thistime = getTime();
            var mselapsed = thistime - lasttime;
            lasttime = thistime;

            _.each(this.objects, function(obj) {

                gl.updateObj(_this.cfg, obj, mselapsed / 1000, _this.astack); //todo: saubermachen (ms)

            });

            //Actionstack leeren
            this.astack = {};
        },

        spawnPlayer: function(playername) {

            var player = {
                type: "player",
                x: 0, y: 0,      //Koordinaten
                ma: 45,           //Bewegungswinkel
                s: 0,//100            //Speed
                va: 135.9234567890123,         //Sichtwinkel
                cr: 18,          //Kollisionsradius
                e: 100,          //Energie
                name: playername
            };

            this.objects.push(player);

            return player;
        },

        setPlayerAction: function(playername, action, actiontime) {

            var playeractionstack = this.astack[playername];

            if(!playeractionstack) {
                playeractionstack = [];
            }

            var timediff = getTime() - actiontime;

            if(timediff < 0) { timediff = 0; }
            if(timediff > 1000) { timediff = 1000; }

            playeractionstack.push({ action: action, timediff: timediff });

            this.astack[playername] = playeractionstack;
        },

        // ---------

        /*
            bereitet aus dem Mapfile geladene statics für die Verarbeitung vor
         */
        _loadStatics: function(map) {
            var countCps = 0;

            for (var i = 0, len = map.statics.length; i < len; i++) {
                var stc = map.statics[i];


                // Breite und Höhe bestimmen falls nicht angegeben
                if((!stc.w || !stc.h) && stc.ps) {
                    var max = 0;
                    var may = 0;
                    stc.ps.forEach(function(p) {
                        p.forEach(function(v) {
                            if (v.x > max) { max = v.x; }
                            if (v.y > may) { may = v.y; }
                        });
                    });

                    stc.w = max;
                    stc.h = may;
                }


                // Kollisionsvektoren bilden
                if(stc.ps) {
                    var cps = [];

                    stc.ps.forEach(function(p) {

                        var plen = p.length;
                        for(var i = 0; i < plen - 1; i++) {
                            cps.push({
                                x1: p[i].x,
                                y1: p[i].y,
                                x2: p[i+1].x,
                                y2: p[i+1].y
                            });
                        }
                        cps.push({
                            x1: p[plen - 1].x,
                            y1: p[plen - 1].y,
                            x2: p[0].x,
                            y2: p[0].y
                        });

                    });

                    if(stc.cps) {
                        stc.cps = stc.cps.concat(cps);
                    } else {
                        stc.cps = cps;
                    }

                }


                if (stc.cps) {
                    // Winkel der Collisionsvektoren ausrechnen
                    stc.cps.forEach(function(item) {
                        item.a = vector.directionlessAngle(vector.vector2angleAbs(item.x2 - item.x1, item.y2 - item.y1).a);
                    });

                    //Zählen
                    countCps += stc.cps.length;
                }



                //Einfügen
                this.statics.push(stc);
            }

            log("info", this.statics.length + " static objects loaded, " + countCps + " collisionpaths");

        }


    };

    //mach den _init und gib das objekt aus
    obj._init(worldname);
    return obj;
};