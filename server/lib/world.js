var vector = new require( __dirname + "/lib/vector.js")();

exports = module.exports = function(collection, worldname) {
    var obj = {

        // ------------

        dbc: null,
        name: null,

        // ------------

        statics: [],


        // ------------------------------------------------------------
        // ------------------------------------------------------------

        /*
            Konstruktor & Einstellungen
         */
        _init: function(collection, worldname) {

            this.dbc = collection;     //DB-Collection
            this.name = worldname;   //Name der Welt


            var map = require( __dirname + "/../maps/"+worldname+".js");  //Map-Einstellungen

            this._loadStatics(map);


        },

        // -------------------------------------------------------------
        // -------------------------------------------------------------

        /*
            Für den Main-Loop, wird vom Worldserver aufgerufen
         */
        lastupdate: Date.now(),
        update: function() {
            var _this = this;

            var thistime = Date.now();
            var secselapsed = (thistime - this.lastupdate) / 1000;
            this.lastupdate = thistime;


            this.dbc.find({}).each(function(err, obj) {

                if(obj.cr) {
                    _this._checkStaticCollisions(obj, secselapsed, thistime);
                }
                if(obj.type == "player") {
                    _this._checkPlayerCollisions(obj, secselapsed, thistime);
                    _this._updatePlayerActions(obj, secselapsed, thistime);
                }
                if(obj.s) {
                    _this._updatePosition(obj, secselapsed, thistime);
                }

            });
        },

        _checkStaticCollisions: function(obj, secselapsed, thistime) {


        },

        _checkPlayerCollisions: function(obj, secselapsed, thistime) {


        },

        _updatePlayerActions: function(obj, secselapsed, thistime) {


        },

        _updatePosition:  function(obj, secselapsed, thistime) {

        },

        // -------------------------------------------------------------
        // -------------------------------------------------------------

        /*
            Löscht alle Objekte aus der Welt
        */
        purge: function() {
            this.dbc.remove();
        },


        /*
            Sucht einen Spieler
        */
        getPlayer: function(playername, callback) {
            this.dbc.findOne( { "type": "player", name: playername }, function(err, player) {
                callback(player);
            });
        },


        /*
            Platziert einen Spieler in der Welt (und vernichtet vorher den alten!)
        */
        spawnPlayer: function(playername) {

            // evtl. alten Spieler löschen
            this.dbc.remove( { "type": "player", name: playername } );

            this.dbc.insert( {
                type: "player",
                x: 0, y: 0,      //Koordinaten
                ma: 0,           //Bewegungswinkel
                s: 0,            //Speed
                va: 135.9234567890123,         //Sichtwinkel
                cr: 18,          //Kollisionsradius
                e: 100,          //Energie
                name: playername
            });
        },

        /*
            ein Spieler führt eine Aktion aus

            hier werden je nach Aktionscode auf das Spielerobjekt werte gesetzt
            im Client sind die Aktionscodes mit Keycodes verbunden (Tastendruck)
         */
        setPlayerAction: function(playername, action) {

            var update = null;

            switch(action) {

                case "t1":
                    update = {$set: {thrusting: true}};
                    break;
                case "t0":
                    update = {$unset: {thrusting: 1}};
                    break;

                case "b1":
                    update = {$set: {breaking: true}};
                    break;
                case "b0":
                    update = {$unset: {breaking: 1}};
                    break;

                case "r1":
                    update = {$set: {rturning: true}};
                    break;
                case "r0":
                    update = {$unset: {rturning: 1}};
                    break;

                case "l1":
                    update = {$set: {lturning: true}};
                    break;
                case "l0":
                    update = {$unset: {lturning: 1}};
                    break;

                case "s1":
                    update = {$set: {stopping: true}};
                    break;
                case "s0":
                    update = {$unset: {stopping: 1}};
                    break;

                case "sa1":
                    update = {$set: {shooting: true}};
                    break;
                case "sa0":
                    update = {$unset: {shooting: 1}};
                    break;

                case "sb1":
                    update = {$set: {shooting2: true}};
                    break;
                case "sb0":
                    update = {$unset: {shooting2: 1}};
                    break;

                case "as":
                    update = {$unset: {thrusting: 1, breaking: 1, rturning: 1, lturning: 1, stopping: 1, shooting: 1, shooting2: 1}};
                    break;

            }

            if (update) {

                this.dbc.findAndModify(
                    { "type": "player", name: playername },
                    [],
                    update,
                    {},
                    function(err, object) {}
                );

            }

        },

        /*
            holt alle Objekte, die ein bestimmter Spieler sehen darf
        */
        getVisibleObjects: function(playername, callback) {
            var _this = this;

            var objects = [];
            var player = null;

            //todo: vorerst alle Objekte !!
            this.dbc.find({}).toArray(function(err, docs) {

                docs.forEach(function(doc) {

                    if (doc && doc.type == "player" && doc.name == playername) {
                        player = _this.stripObjForSending(doc);
                    }

                    if (doc) {
                        objects.push(_this.stripObjForSending(doc));
                    }

                });

                callback(player, objects);

            });

        },

        stripObjForSending: function(obj) {

            delete obj._id;

            //todo: perfomance check! bringt evtl garnicht so viel
            for (var prop in obj) {
                if (typeof obj[prop] == "number") {
                    obj[prop] = (obj[prop]+0.5)|0; // schnelles runden
                }
            }

            return obj;
        },

        // ------------------------------------------------------------
        // ------------------------------------------------------------

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

            log("info", this.statics.length + " statics objects loaded, " + countCps + " collisionpaths");

        }


    };

    //mach den _init und gib das objekt aus
    obj._init(collection, worldname);
    return obj;
};