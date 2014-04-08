var _ = require( __dirname + "/lodash.js");
var gl = require( __dirname + "/gamelogic.js");
var vector = new require( __dirname + "/vector.js")();
var zmq = require('zmq');


// ----------------------------------------------
// ---------------------------- private Funktionen
// ----------------------------------------------

var starttime = 0;
var getTime = function() {
    return Date.now() - starttime;
};

var lasttime = 0;

// ---

var encode = function(objs) {
    return JSON.stringify(objs);
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
        objects: [

            //debug
            {  type: "player", x:0, y:0, s:0, ma:0, va:0, cr:18, e:100, name: "monkey" }

        ],
        cfg: {},

        // -----------

        /*
            Konstruktor & Einstellungen
         */
        _init: function(worldname) {
            var _this = this;

            this.name = worldname;   //Name der Welt

            // Einstellungen holen! Map-Einstellungen überschreiben globale
            var map = require( __dirname + "/../maps/"+worldname+".js");  // Map-Einstellungen
            this.cfg = _.merge(require( __dirname + "/../maps/globalcfg.js"), map.cfg); // globale einstellungen


            this._loadStatics(map);

            // Weltzeit initial setzen
            starttime = getTime();

            // Publisher verbinden
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

            // ----------------------------------------------------------------------
            // ----------------------------------------------------------------------

            // slave verlangt die aktuellen Objekte der Welt
            req.on("getobjects", function(data, respond) {
                respond({ objects: _this.objects, time: getTime() });
            });

            // slave verlangt die statics und die config, um sich zu initialisieren
            req.on("getstaticdata", function(data, respond) {
                respond({ statics: _this.statics, cfg: _this.cfg, mastertime: getTime()});
            });

            // slave möchte einen spieler spawnen
            req.on("spawnplayer", function(data, respond) {
                respond({ player: _this.spawnPlayer(data.name) });
            });

            // slave hat eine action empfangen, möchte diese verarbeiten lassen und braucht dann den verarbeiteten spieler
            req.on("setplayeraction", function(data, respond) {
                var player = _this.setPlayerAction(data.name, data.action);
                respond({player: player});
            });

            // slave möchte die config verändern (Adminfunktion)
            req.on("setcfg", function(data, respond) {
                log("info", "config changed by admin");
                oi(data.subcfg);
                _this.cfg = _.merge(_this.cfg, data.subcfg);
                respond({cfg: _this.cfg});
            });

            // ----------------------------------------------------------------------
            // ----------------------------------------------------------------------

            // Synchronisere die masterzeit mit allen slaves
            publish("timesync", {mastertime: getTime()});
            setInterval(function(){
                publish("timesync", {mastertime: getTime()});
            }, 10000);

            // ----------------------------------------------------------------------
            // ----------------------------------------------------------------------

        },

        // ----------

        /*
            Main-Loop, updated die Welt
         */
        update: function() {
            var _this = this;

            // aktuelle Zeit
            var thistime = getTime();
            var secselapsed = (thistime - lasttime) / 1000;

            lasttime = thistime;

            _.each(this.objects, function(obj) {

                if(obj.type == "player") {
                    _this.checkPlayerEvents(obj, thistime);
                    _this.checkPlayerCollisions(obj, thistime);
                } else {
                    _this.checkObjectEvents(obj, thistime);
                }

                gl.updateObj(_this.cfg, obj, secselapsed, _this.statics);

            });

            // tote Objekte entfernen
            this.objects = _.reject(this.objects, function(obj) {

                return obj.dead || (obj.ad && (obj.t + (obj.ad * 1000) < thistime));

            });
        },

        /*
            Spawnt einen Spieler in der Welt
         */
        spawnPlayer: function(playername) {

            var player = {
                type: "player",

                x: -106, y: -494,       //Koordinaten
                ma: 188,                //Bewegungswinkel
                s:  this.cfg.player.maxspeed / 2, //Speed
                va: 188,                //Sichtwinkel

                cr: this.cfg.player.cr,          //Kollisionsradius
                e:  this.cfg.player.maxenergy,   //Starte mit max. Energie
                name: playername
            };

            this.objects.push(player);

            return player;
        },


        /*
            Wendet eine Änderung je nach Actioncode auf den Spieler an und gibt diesen zurück
         */
        setPlayerAction: function(playername, action) {

            var player = _.find(this.objects, function(obj) { return obj.type == "player" && obj.name == playername; });

            if(player) {
                switch(action) {

                    case "t1":
                        player.thrusting = true;
                        break;
                    case "t0":
                        player.thrusting = false;
                        break;
                    case "b1":
                        player.breaking = true;
                        break;
                    case "b0":
                        player.breaking = false;
                        break;

                    case "r1":
                        player.rturning = true;
                        break;
                    case "r0":
                        player.rturning = false;
                        break;
                    case "l1":
                        player.lturning = true;
                        break;
                    case "l0":
                        player.lturning = false;
                        break;

                    case "s1":
                        player.stopping = true;
                        break;
                    case "s0":
                        player.stopping = false;
                        break;

                    case "sa1":
                        player.shooting = true;
                        break;
                    case "sa0":
                        player.shooting = false;
                        break;

                    case "sb1":
                        player.shooting2 = true;
                        break;
                    case "sb0":
                        player.shooting2 = false;
                        break;

                    case "as":
                        player.thrusting = false;
                        player.breaking = false;
                        player.rturning = false;
                        player.lturning = false;
                        player.stopping = false;
                        player.shooting = false;
                        player.shooting2 = false;
                        break;

                }
            }

            return player;
        },

        checkPlayerEvents: function(player, thistime) {


            if( player.shooting ) {

                this.playerShoot(player, "bullet", thistime);

            }

            if( player.shooting2 ) {

                this.playerShoot(player, "bomb", thistime);

            }

            if( player.exploding ) {

                this.playerExplode(player, thistime);

            }

        },

        checkObjectEvents: function(obj, thistime) {

            if(obj.exploding) {

                this.bombExplode(obj, thistime);

            }

        },

        bombExplode: function(obj, thistime) {

            var type = obj.type;
            var ocfg = this.cfg.projectiles[type];

            //Anfangsbedingung
            if(!obj.expst) {
                obj.expst = thistime; //Startzeit
                obj.expem = 0;        //bereits emitierte Partikel

                obj.ad = ocfg.explosionduration;
                obj.t = thistime;
            }


            var duration = ocfg.explosionduration;
            var particlecount = ocfg.explosionparticles;

            obj.expp = ((thistime - obj.expst) / 1000) / duration; //aktueller Stand 0-1

            var emitcount = (particlecount * obj.expp - obj.expem); //jetzt zu emitierende Partikel

            for( var i = 0; i < emitcount; i++ ) {

                //emitiere einen partikel
                var r = vector.getRandomNumber(5, 10);

                var bulletspeed = vector.getRandomNumber(this.cfg.projectiles.bombexplosion.speedmin, this.cfg.projectiles.bombexplosion.speedmax);

                var pv = vector.angleAbs2vector(obj.ma, obj.s);
                var bv = vector.angleAbs2vector(vector.getRandomNumber(0, 359), bulletspeed);
                var bas = vector.vector2angleAbs(pv.x + bv.x, pv.y + bv.y);

                var particle = {
                    type: "bombexplosion",

                    x: obj.x + vector.getRandomNumber(-10, 10),
                    y: obj.y + vector.getRandomNumber(-10, 10),
                    ma: bas.a,
                    s: bas.s,
                    //o: player.name, // kein owner
                    cr: r,
                    t: thistime,
                    isanim: true, // todo: sollte vom client eigentlich eingestellt sein
                    ad: this.cfg.projectiles.bombexplosion.lifetime,
                    scale: (2*r) / 30
                };

                obj.expem++;
                this.objects.push(particle);

            }

        },

        playerExplode: function(player, thistime) {

            //Anfangsbedingung
            if(!player.expst) {
                player.expst = thistime; //Startzeit
                player.expem = 0;        //bereits emitierte Partikel
            }

            var duration = this.cfg.player.explosionduration;
            var particlecount = this.cfg.player.explosionparticles;

            player.expp = ((thistime - player.expst) / 1000) / duration; //aktueller Stand 0-1

            var emitcount = (particlecount * player.expp - player.expem); //jetzt zu emitierende Partikel

            for( var i = 0; i < emitcount; i++ ) {

                //emitiere einen partikel
                var r = vector.getRandomNumber(5, 15);

                var particle = {
                    type: "explosion",

                    x: player.x + vector.getRandomNumber(-20, 20),
                    y: player.y + vector.getRandomNumber(-20, 20),
                    ma: player.ma,
                    s: player.s * vector.getRandomFloat(0.6, 1),
                    o: player.name,
                    cr: r,
                    t: thistime,
                    isanim: true,// todo: sollte vom client eigentlich eingestellt sein
                    ad: this.cfg.projectiles.explosion.lifetime,
                    scale: (2*r) / 30
                };

                player.expem++;
                this.objects.push(particle);

            }

            if (player.expp >= 1) {

                //emitiere finale partikel
                for( var i = 0; i < this.cfg.player.explosionfinalparticles; i++ ) {

                    //emitiere einen partikel
                    var r = vector.getRandomNumber(5, 15);

                    var bulletspeed = vector.getRandomNumber(this.cfg.projectiles.explosion.speedmin, this.cfg.projectiles.explosion.speedmax);

                    var pv = vector.angleAbs2vector(player.ma, player.s);
                    var bv = vector.angleAbs2vector(vector.getRandomNumber(0, 359), bulletspeed);
                    var bas = vector.vector2angleAbs(pv.x + bv.x, pv.y + bv.y);

                    var particle = {
                        type: "explosion",

                        x: player.x + vector.getRandomNumber(-10, 10),
                        y: player.y + vector.getRandomNumber(-10, 10),
                        ma: bas.a,
                        s: bas.s,
                        o: player.name,
                        cr: r,
                        t: thistime,
                        isanim: true, // todo: sollte vom client eigentlich eingestellt sein
                        ad: this.cfg.projectiles.explosion.lifetime,
                        scale: (2*r) / 30
                    };

                    obj.expem++;
                    this.objects.push(particle);
                }


                player.exploding = false;
                player.expst = null;
                player.inactive = true;
                player.breakingtostop = true;
                player.breaking = false;
                player.thrusting = false;
                player.shooting = false;
                player.shooting2 = false;

                var _this = this;
                setTimeout(function() {
                    player.dead = true;
                    _this.spawnPlayer(player.name);
                }, this.cfg.player.respawntime * 1000);

            }

        },

        playerShoot: function(player, type, thistime) {

            // Config und Zeitpunkt des letzten Schußes holen
            var bcfg = this.cfg.projectiles[type];
            var lastshot = player["lastshot_"+type];

            // Checken, ob Spieler genug Energie hat und ob der letzte Schuß lange genug her ist
            if( player.e > bcfg.edrain && (!lastshot || lastshot + 1000 / bcfg.firerate < thistime)) {

                var pv = vector.angleAbs2vector(player.ma, player.s); // Spieler Bewegungsvektor
                var bv = vector.angleAbs2vector(player.va, bcfg.speed); // Projektil-Vektor (in Sichtrichtung d. Spielers)

                // Vektoren addieren
                var bas = vector.vector2angleAbs(pv.x + bv.x, pv.y + bv.y);

                var projectile = {
                    type: type,
                    x: player.x,
                    y: player.y,
                    ma: bas.a,
                    s: bas.s,
                    o: player.name,
                    cr: bcfg.cr,
                    t: thistime,
                    ad: bcfg.lifetime
                };

                if( type == "bomb") {
                    projectile.isanim = true; // todo: sollte vom client eigentlich eingestellt sein
                    projectile.cyclicanim = 0.4; // todo: sollte vom client eigentlich eingestellt sein
                }

                // Objekt hinzu
                this.objects.push(projectile);

                // Schußzeit am Spieler markieren
                player["lastshot_"+type] = thistime;

                // Energie für Schuß abziehen
                player.e -= bcfg.edrain;
            }

        },

        checkPlayerCollisions: function(obj, thistime) {
            var _this = this;

            // wenn Spieler nicht inaktiv oder am explodieren
            if(!obj.inactive && !obj.exploding) {

                // alle objekte durchgehen
                _.each(this.objects, function(proj) {

                    // wenn es ein Projektiltyp ist && Spieler nicht der Besitzer && Radien überlappen
                    if( (proj.type == "bullet" || proj.type == "bomb" || proj.type == "explosion" || proj.type == "bombexplosion") &&
                        !proj.dead &&
                        proj.o != obj.name &&
                        vector.vectorAbs(proj.x - obj.x, proj.y - obj.y) < obj.cr + proj.cr) {

                        // Spieler getroffen!!



                        //emitiere einen rauchpartikel
                        var r = vector.getRandomNumber(5, 6);

                        if(proj.type == "bomb") {
                            r = vector.getRandomNumber(10, 15);
                        }

                        var particle = {
                            type: "bullethit",

                            x: proj.x,
                            y: proj.y,
                            ma: proj.ma,
                            s: 60,
                            o: obj.name,
                            cr: r,
                            t: thistime,
                            isanim: true,
                            ad: 0.5,
                            scale: (2*r) / 12
                        };
                        _this.objects.push(particle);


                        if(proj.type == "bomb") {

                            // lasse explodieren
                            proj.exploding = true;

                        } else {

                            // Projektil beim nächsten durchlauf löschen
                            proj.dead = true;
                        }


                        // Energie abziehen
                        obj.e = obj.e - _this.cfg.projectiles[proj.type].dmg;

                        // Prüfen, ob Spieler noch lebt
                        if(obj.e < 0) {
                            obj.exploding = true;
                        }


                    }


                });

            }

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