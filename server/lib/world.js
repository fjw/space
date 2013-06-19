var vector = new require( __dirname + "/vector.js")();
var _ = require( __dirname + "/lodash.js");


exports = module.exports = function(rc, worldname, options) {
    var obj = {

        // ------------

        dbc: null,
        name: null,

        // ------------

        statics: [],
        cfg: {},

        // ------------------------------------------------------------
        // ------------------------------------------------------------

        /*
            Konstruktor & Einstellungen
         */
        _init: function(rc, worldname, options) {

            this.dbc = rc;     //DB-Collection
            this.name = worldname;   //Name der Welt

            if(options) {
                if(options.flush) {
                    this.dbc.flushall();
                }
            }


            var map = require( __dirname + "/../maps/"+worldname+".js");  //Map-Einstellungen

            this.cfg = _.extend(require( __dirname + "/../maps/globalcfg.js"), map.cfg);


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


            if (this.dbc && this.dbc.connected) {

                var thistime = Date.now();
                var secselapsed = (thistime - this.lastupdate) / 1000;
                this.lastupdate = thistime;

                var key = this.name;


                //get Actionstack
                this.dbc.get(this.name + "_actionStack", function(err, astack) {


                    if (astack) {
                        astack = _this._decodeObject(astack);
                        console.log(astack);
                    } else {
                        astack = {};
                    }



                    //eine umdrehung machen
                    _this.dbc.llen(key, function(err, len) {


                        for (var i = 0; i < len; i++) {

                            _this.dbc.lpop(key, function(err, mobj) {

                                if (mobj) {

                                    var resobj = _this._updateObj(_this._decodeObject(mobj), secselapsed, thistime, astack);

                                    if (resobj) {
                                        _this.dbc.rpush(key, _this._encodeObject(resobj));
                                    }
                                }

                            });


                        }


                    });


                    //actionstack leeren
                    _this.dbc.del(_this.name + "_actionStack");
                });

            }


        },

        _updateObj: function(obj, secselapsed, thistime, astack) {

            if(obj.cr) {
                this._checkStaticCollisions(obj, secselapsed, thistime);
            }


            if(obj.type == "player") {
                //this._checkPlayerCollisions(obj, secselapsed, thistime);
                this._updatePlayerActions(obj, secselapsed, thistime, astack);
            }


            if(obj.s) {
                this._updatePosition(obj, secselapsed, thistime);
            }



            if (obj.deleted) {
                return null;
            } else {
                return obj;
            }

        },

        _checkStaticCollisions: function(obj, secselapsed, thistime) {


            var collided = false;


            for( var i = 0, len = this.statics.length; i < len; i++ ) {

                var stat = this.statics[i];

                // dieser static hat cp? => kann kollidieren?
                // es kann immer nur mit EINEM static pro Loop kollidiert werden!
                // Reichweite abchecken durch BoundingBox
                if( stat.cps && !collided && vector.isBoxOverlap(obj.x - obj.cr, obj.y - obj.cr,
                                                                obj.cr * 2, obj.cr * 2,
                                                                stat.x, stat.y,
                                                                stat.w, stat.h)) {


                    // Kollisionen suchen
                    var clplist = [];
                    stat.cps.forEach(function(cp) {
                        var dpp = vector.distancePointFromPath(obj.x, obj.y, cp.x1 + stat.x, cp.y1 + stat.y, cp.x2 + stat.x, cp.y2 + stat.y);

                        if (dpp.d < obj.cr) {

                            clplist.push({
                                dpp: dpp,
                                cp: cp
                            });
                        }
                    });

                    if (clplist.length > 0) {

                        var clpa, sx, sy;
                        if (clplist.length > 1) {
                            //mehrere Kollisionen, zwischenwinkel ermitteln
                            var sum = _.reduce(clplist, function(memo, item){ return memo + directionlessAngle(item.cp.a); }, 0);
                            clpa = sum / clplist.length;

                            var xsum = _.reduce(clplist, function(memo, item){ return memo + item.dpp.sx; }, 0);
                            sx = xsum / clplist.length;

                            var ysum = _.reduce(clplist, function(memo, item){ return memo + item.dpp.sy; }, 0);
                            sy = ysum / clplist.length;

                        } else {
                            clpa = clplist[0].cp.a;
                            sx = clplist[0].dpp.sx;
                            sy = clplist[0].dpp.sy;
                        }

                        // !Kollision!

                        // Einfallswinkel gleich Ausfallswinkel
                        obj.ma = vector.angleInBoundaries(2 * clpa - obj.ma);

                        // Objekt im rechten Winkel verschieben aus dem Kollisionsradius schieben
                        var cdx = obj.x - sx;
                        var cdy = obj.y - sy;
                        var b = vector.vectorAbs(cdx, cdy);
                        obj.x = sx + (cdx / b * (obj.cr + 2)); // 2 mehr für die spitzen winkel
                        obj.y = sy + (cdy / b * (obj.cr + 2));

                        obj.s *= this.cfg.staticbouncefactor;
                        collided = true;

                    }

                }


                if (collided) {
                    break;
                }

            }

        },

        _checkPlayerCollisions: function(obj, secselapsed, thistime) {


/*
            if(!obj.inactive && !obj.exploding) {

                //finde alle Objekte die kollidieren könnten
                this.dbc.find({ type: { $in: ["bullet", "bomb", "explosion"] }, o: { $ne: obj.name } }).each(function(err, proj) {

                    if(err) {
                        log("error", err);
                    }
                    if(proj && !err) {

                        if (vector.vectorAbs(proj.x - obj.x, proj.y - obj.y) < obj.cr + proj.cr) {

                            // Spieler getroffen!!

                            //todo: do smth

                        }

                    }

                });

            }
            */

        },

        _updatePlayerActions: function(obj, secselapsed, thistime, astack) {


            var actions = astack[obj.name];

            if (actions) {

                console.log(actions);

                _.each(actions, function(value, key) {

                    if(value) {
                        obj[key] = true;
                    } else {
                        delete(obj[key]);
                    }

                });

            }


            var v = {x:0,y:0};

            if (obj.rturning) {
                obj.va = vector.angleInBoundaries(obj.va + this.cfg.playerrotationspeed * secselapsed);
            }
            if (obj.lturning) {
                obj.va = vector.angleInBoundaries(obj.va - this.cfg.playerrotationspeed * secselapsed);
            }

            if (obj.thrusting) {
                v = vector.angleAbs2vector(obj.va, this.cfg.playeracceleration * secselapsed );
            }
            if (obj.breaking) {
                v = vector.angleAbs2vector( vector.angleInBoundaries(obj.va-180), this.cfg.playerbackacceleration * secselapsed );
            }

            if (obj.thrusting || obj.breaking) {
                // Beschleunigungsvektor addieren (falls vorhanden)
                var m = vector.angleAbs2vector(obj.ma, obj.s);

                m.x += v.x;
                m.y += v.y;

                // neue Werte im Objekt vermerken
                var as = vector.vector2angleAbs(m.x, m.y);

                obj.s = as.s;
                obj.ma = as.a;

                if (obj.s > this.cfg.playermaxspeed) {
                    obj.s = this.cfg.playermaxspeed;
                }
            }

            if (obj.stopping) {
                obj.s = obj.s - this.cfg.playerstopacceleration * secselapsed;
                if (obj.s < 5) { obj.s = 0; }
            }



        },

        _updatePosition:  function(obj, secselapsed, thistime) {

            // Vektor aus aktueller Geschwindigkeit bestimmen
            var m = vector.angleAbs2vector(obj.ma, obj.s);

            // Änderung pro Sekunde
            obj.x += m.x * secselapsed;
            obj.y += m.y * secselapsed;

        },

        // -------------------------------------------------------------
        // -------------------------------------------------------------

        /*
            Löscht alle Objekte aus der Welt
        */
        purge: function() {
           log("error", "todo");
        },


        /*
            Sucht einen Spieler
        */
        getPlayer: function(playername, callback) {

            this.queryObject(this.name, function(item) {
                return (item.type == "player" && item.name == playername);
            }, callback);

        },


        queryObject: function(key, peritemcallback, callback) {
            var _this = this;

            this.dbc.llen(key, function(err, len) {


                if (len > 0) {

                    var called = false;
                    var fired = 0;

                    var checkAll = function() {

                        fired++;

                        if (fired >= len && !called) {
                            //kein Ergebnis gefunden
                            callback(null);
                            called = true;
                        }
                    };


                    for(var i=0; i < len; i++) {

                        _this.dbc.lindex(key, i, function(err, bitem) {

                            if(bitem) {

                                var item = _this._decodeObject(bitem);

                                if (peritemcallback(item)) {

                                    if(!called) {
                                        called = true;
                                        callback(item);
                                    }

                                }

                            }

                            checkAll();
                        });

                    }

                } else {

                    //empty list
                    callback(null);

                }

            });
        },

        insertObject: function(obj) {

            this.dbc.lpush(this.name, this._encodeObject(obj));

        },


        /*
            Platziert einen Spieler in der Welt (und vernichtet vorher den alten!)
        */
        spawnPlayer: function(playername) {

            // evtl. alten Spieler löschen
            //this.dbc.remove( { "type": "player", name: playername } );
            //todo: checkIT


            this.insertObject( {
                type: "player",
                x: 0, y: 0,      //Koordinaten
                ma: 45,           //Bewegungswinkel
                s: 100,            //Speed
                va: 135.9234567890123,         //Sichtwinkel
                cr: 18,          //Kollisionsradius
                e: 100,          //Energie
                name: playername
            });
        },


        /*
            ein Spieler führt eine Aktion aus

            hier werden je nach Aktionscode auf den Aktionstack Werte gesetzt
            world.update liest den Stack und wendet sie dann auf die spieler an
            im Client sind die Aktionscodes mit Keycodes verbunden (Tastendruck)
        */
        setPlayerAction: function(playername, action) {
            var _this = this;

            this.dbc.get(this.name + "_actionStack", function(err, astack) {


                if (astack) {
                    astack = _this._decodeObject(astack);
                } else {
                    astack = {};
                }

                var ao = astack[playername];

                if(!ao) {
                    ao = {};
                }


                switch(action) {

                    case "t1":
                        ao.thrusting = true;
                        break;
                    case "t0":
                        ao.thrusting = false;
                        break;
                    case "b1":
                        ao.breaking = true;
                        break;
                    case "b0":
                        ao.breaking = false;
                        break;

                    case "r1":
                        ao.rturning = true;
                        break;
                    case "r0":
                        ao.rturning = false;
                        break;
                    case "l1":
                        ao.lturning = true;
                        break;
                    case "l0":
                        ao.lturning = false;
                        break;

                    case "s1":
                        ao.stopping = true;
                        break;
                    case "s0":
                        ao.stopping = false;
                        break;

                    case "sa1":
                        ao.shooting = true;
                        break;
                    case "sa0":
                        ao.shooting = false;
                        break;

                    case "sb1":
                        ao.shooting2 = true;
                        break;
                    case "sb0":
                        ao.shooting2 = false;
                        break;

                    case "as":
                        ao.thrusting = false;
                        ao.breaking = false;
                        ao.rturning = false;
                        ao.lturning = false;
                        ao.stopping = false;
                        ao.shooting = false;
                        ao.shooting2 = false;
                        break;


                }

                if ( ao ) {
                    astack[playername] = ao;

                    _this.dbc.set(_this.name + "_actionStack", _this._encodeObject(astack));
                }

            });

        },

        /*
            holt alle Objekte, die ein bestimmter Spieler sehen darf
        */
        getVisibleObjects: function(playername, callback) {
            var _this = this;

            var items = [];
            var player = null;

            //todo: vorerst alle objekte ausgeben
            this.dbc.llen(this.name, function(err, len) {

                if (len > 0) {

                    for(var i=0; i < len; i++) {

                        _this.dbc.lindex(_this.name, i, function(err, bitem) {

                            if (bitem) {

                                var item = _this._decodeObject(bitem);

                                if (item) {

                                    if (item.type == "player" && item.name == playername) {
                                        player = _this.stripObjForSending(item);
                                    }

                                    items.push(_this.stripObjForSending(item));

                                    if (items.length == len) {
                                        callback(player, items);
                                    }

                                }

                            }

                        });

                    }

                } else {

                    //empty list
                    callback(null, []);

                }

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

        _encodeObject: function(obj) {
            return JSON.stringify(obj);
            //return msgpack.encode(obj);
        },

        _decodeObject: function(obj) {
            return JSON.parse(obj);
            //return msgpack.decode(obj);
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

            log("info", this.statics.length + " static objects loaded, " + countCps + " collisionpaths");

        }


    };

    //mach den _init und gib das objekt aus
    obj._init(rc, worldname, options);
    return obj;
};