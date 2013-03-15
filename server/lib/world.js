exports = module.exports = function() {

    var obj = {

        statics: [],
        objects: [],
        objecttypes: [],

        lastupdate: Date.now(),

        worldfunctions: require( __dirname + "/worldfunctions.js")(),

        _init: function() {

            var map = require(__dirname + "/../maps/testworld.js");
            this.objects = map.objects;
            this.statics = map.statics;
            this.objecttypes = map.objecttypes;

            this._prepareStatics();


        },

        _prepareStatics: function() {
            var _this = this;

            _.each(this.statics, function(stat) {

                if (stat.p) {
                    //Kollisionspfade aus Punktpfaden erzeugen

                    var cps = [];
                    for(var i = 0; i < stat.p.length - 1; i++) {
                        cps.push({
                            x1: stat.p[i].x,
                            y1: stat.p[i].y,
                            x2: stat.p[i+1].x,
                            y2: stat.p[i+1].y
                        });
                    }
                    cps.push({
                        x1: stat.p[stat.p.length - 1].x,
                        y1: stat.p[stat.p.length - 1].y,
                        x2: stat.p[0].x,
                        y2: stat.p[0].y
                    });
                    if (stat.cp) {
                        stat.cp = stat.cp.concat(cps);
                    } else {
                        stat.cp = cps;
                    }

                    //Maximum bei Punktpfaden ermitteln
                    if (!stat.w || !stat.h) {

                        stat.w = _.max(stat.p, function(item){ return item.x; }).x;
                        stat.h = _.max(stat.p, function(item){ return item.y; }).y;

                    }
                }

                _.each(stat.cp, function(cp) {

                    // Berechne die Winkel der Statics-Collisionpaths
                    cp.a = _this.worldfunctions.directionlessAngle(_this.worldfunctions.vector2angleAbs(cp.x2-cp.x1, cp.y2-cp.y1).a);

                });

            });

        },

        // ============================================ SERVER-WORLD-CALCULATIONS ============================================
        update: function() {
            var _this = this;

            var thistime = Date.now();
            var secselapsed = (thistime - this.lastupdate) / 1000;
            this.lastupdate = thistime;


            _.each(this.objects, function(obj) {
                _this.worldfunctions.updateObj(obj, _this.statics, secselapsed);

                if(obj.type == "player") {

                    _this.playerFunctions(obj, secselapsed, thistime);
                    _this.playerCollisions(obj, secselapsed, thistime);

                }
            });

            //alte Bullets & Bombs entfernen
            this.objects = _.filter(this.objects, function(item) {

                if(item.deleted) {
                    return false;
                } else if( item.ad ) {
                    return item.t + item.ad * 1000 > thistime;
                } else {
                    return true;
                }

            });


        },


        playerFunctions: function(obj, secselapsed, thistime) {

            // Recharge
            var egenpersec = 14;
            var maxenergy = 100;
            obj.e += egenpersec * secselapsed;
            if (obj.e > maxenergy) { obj.e = maxenergy; }


            // Schießen
            if (obj.shooting) {

                var bulletspeed = 400;
                var shotspersec = 0.3;
                var type = "bullet";
                var cr = 8;
                var lastshot = obj.lastshot;
                var edrain = 15;

                if(obj.e > edrain && (!lastshot || lastshot + shotspersec * 1000 < thistime) ) {

                    var pv = this.worldfunctions.angleAbs2vector(obj.ma, obj.s);
                    var bv = this.worldfunctions.angleAbs2vector(obj.va, bulletspeed);

                    var bas = this.worldfunctions.vector2angleAbs(pv.x + bv.x, pv.y + bv.y);

                    var bullet = {
                        type: type,

                        x: obj.x, y: obj.y,
                        ma: bas.a,
                        s: bas.s,
                        o: obj.name,
                        cr: cr,
                        t: thistime,
                        ad: 6 //Lifetime
                    };

                    this.objects.push(bullet);

                    obj.lastshot = thistime;

                    //energie abziehen
                    obj.e = obj.e - edrain;
                }
            }

            // Bomben
            /*
            if (obj.shooting2) {

                var bulletspeed = 250;
                var shotspersec = 1;
                var type = "bomb";
                var cr = 10;
                var lastshot = obj.lastshot2;
                var edrain = 15;

                if(obj.e > edrain && (!lastshot || lastshot + shotspersec * 1000 < thistime )) {

                    var pv = this.worldfunctions.angleAbs2vector(obj.ma, obj.s);
                    var bv = this.worldfunctions.angleAbs2vector(obj.va, bulletspeed);

                    var bas = this.worldfunctions.vector2angleAbs(pv.x + bv.x, pv.y + bv.y);

                    var bullet = {
                        type: type,

                        x: obj.x, y: obj.y,
                        ma: bas.a,
                        s: bas.s,
                        o: obj.name,
                        cr: cr,
                        t: thistime,
                        ad: 20
                    };

                    this.objects.push(bullet);

                    obj.lastshot2 = thistime;

                    //energie abziehen
                    obj.e = obj.e - edrain;
                }
            }
            */

            // Explosion
            if (obj.exploding) {

                //Anfangsbedingung
                if(!obj.expst) {
                    obj.expst = Date.now(); //Startzeit
                    obj.expem = 0;          //bereits emitierte Partikel
                }

                var duration = 1; //sec
                obj.expp = ((Date.now() - obj.expst) / 1000) / duration; //aktueller Stand 0-1


                var particlecount = 25;

                var emitcount = (particlecount * obj.expp - obj.expem); //jetzt zu emitierende Partikel


                for( var i = 0; i < emitcount; i++ ) {

                    //emitiere einen partikel
                    var r = this.getRandomNumber(5, 15);

                    var particle = {
                        type: "explosion",

                        x: obj.x + this.getRandomNumber(-20, 20),
                        y: obj.y + this.getRandomNumber(-20, 20),
                        ma: obj.ma,
                        s: obj.s * this.getRandomFloat(0.6, 1),
                        o: obj.name,
                        cr: r,
                        t: thistime,
                        isanim: true,
                        ad: duration,
                        scale: (2*r) / 30
                    };

                    obj.expem++;
                    this.objects.push(particle);
                }


                if (obj.expp >= 1) {

                    //emitiere finale partikel
                    for( var i = 0; i < 10; i++ ) {

                        //emitiere einen partikel
                        var r = this.getRandomNumber(5, 15);

                        var bulletspeed = this.getRandomNumber(200, 400);

                        var pv = this.worldfunctions.angleAbs2vector(obj.ma, obj.s);
                        var bv = this.worldfunctions.angleAbs2vector(this.getRandomNumber(0, 359), bulletspeed);
                        var bas = this.worldfunctions.vector2angleAbs(pv.x + bv.x, pv.y + bv.y);

                        var particle = {
                            type: "explosion",

                            x: obj.x + this.getRandomNumber(-10, 10),
                            y: obj.y + this.getRandomNumber(-10, 10),
                            ma: bas.a,
                            s: bas.s,
                            o: obj.name,
                            cr: r,
                            t: thistime,
                            isanim: true,
                            ad: duration,
                            scale: (2*r) / 30
                        };

                        obj.expem++;
                        this.objects.push(particle);
                    }

                    obj.exploding = false;
                    obj.expst = null;
                    obj.inactive = true;
                    obj.breakingtostop = true;
                    obj.breaking = false;
                    obj.thrusting = false;
                    obj.shooting = false;
                    obj.shooting2 = false;

                    var _this = this;
                    setTimeout(function() {
                        //_this.objects = _.reject(_this.objects, function(item) { return item.type == "player" && item.name == obj.name; });
                        obj.deleted = true;
                        _this.spawnPlayer(obj.name);
                    }, 5000);

                }
            }

        },


        playerCollisions: function(obj, secselapsed, thistime) {
            var _this = this;

            if(!obj.inactive && !obj.exploding) {

                _.each(this.objects, function(proj) {

                    if( (proj.type == "bullet" || proj.type == "bomb" || proj.type == "explosion") &&
                         proj.o != obj.name &&
                         _this.worldfunctions.vectorAbs(proj.x - obj.x, proj.y - obj.y) < obj.cr + proj.cr) {

                        // Spieler getroffen!!

                        if (proj.type == "bullet") {
                            //direkter Treffer mit Bullet

                            //Schaden
                            var edrain = 30;

                            //emitiere einen partikel
                            var r = _this.getRandomNumber(5, 6);


                            var pv = _this.worldfunctions.angleAbs2vector(obj.ma, obj.s);
                            var bv = _this.worldfunctions.angleAbs2vector(proj.ma, proj.s);
                            var bas = _this.worldfunctions.vector2angleAbs(pv.x + bv.x, pv.y + bv.y);

                            var particle = {
                                type: "bullethit",

                                x: proj.x,
                                y: proj.y,
                                ma: bas.a,
                                s: bas.s,
                                o: obj.name,
                                cr: r,
                                t: thistime,
                                isanim: true,
                                ad: 0.5,
                                scale: (2*r) / 12
                            };

                            _this.objects.push(particle);

                        }

                        if (proj.type == "bomb") {
                            //direkter Treffer mit Bombe

                            //Schaden
                            var edrain = 70;

                        }

                        if (proj.type == "explosion") {
                            //Kollateralschaden durch Explosion

                            //Schaden
                            var edrain = 10;

                        }

                        proj.deleted = true;

                        //energie abziehen
                        obj.e = obj.e - edrain;

                        if(obj.e < 0) {
                            obj.exploding = true;
                        }

                    }


                });

            }

        },


        spawnPlayer: function(name) {
            var type = _.find(this.objecttypes, function(obj) { return obj.type == "player"; });
            var player = _.clone(type);
            player.name = name;
            this.objects.push(player);

            return player;
        },

        // ============================================

        getRandomNumber: function(min, max) {
            return Math.round(min + (Math.random()*(max-min)));
        },

        getRandomFloat: function(min, max) {
            return min + (Math.random()*(max-min));
        }

    };

    //mach den _init und gib das objekt aus
    obj._init();
    return obj;
};