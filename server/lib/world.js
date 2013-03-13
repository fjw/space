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
                }
            });

            //alte Bullets & Bombs entfernen
            var bulletlifetime = 6; //sec
            var bomblifetime = 20; //sec

            this.objects = _.filter(this.objects, function(item) {

                if(item.type == "bullet") {
                    return item.t + bulletlifetime * 1000 > thistime;
                } else if(item.type == "bomb") {
                    return item.t + bomblifetime * 1000 > thistime;
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
                        t: thistime
                    };

                    this.objects.push(bullet);

                    obj.lastshot = thistime;

                    //energie abziehen
                    obj.e = obj.e - edrain;
                }
            }

            // Bomben
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
                        t: thistime
                    };

                    this.objects.push(bullet);

                    obj.lastshot2 = thistime;

                    //energie abziehen
                    obj.e = obj.e - edrain;
                }
            }

        }

        // ============================================

    };

    //mach den _init und gib das objekt aus
    obj._init();
    return obj;
};