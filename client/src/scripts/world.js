define(["lodash", "gamelogic"], function(_, gl) { return function(name) {

    // Zeitfunktion
    var supportsPerformanceNow = false;
    if(performance && performance.now && typeof(performance.now) == "function") {
        supportsPerformanceNow = true;
    }
    var getTime = function() {
        if(supportsPerformanceNow) {
            return performance.now();
        } else {
            return Date.now();
        }
    }

    var lasttime = 0;

    var obj = {

        objects: [],
        localobjects: [],
        statics: [],

        lastupdate: getTime(),

        cfg: {},

        _init: function(name) {},

        clockDiff: 0,

        getLocalTime: function() {
            return getTime();
        },

        getServerTime: function() {
            return getTime() + this.clockDiff;
        },

        /*
             Ein neues Update kam vom Server
        */
        updateFromServer: function(worldobjects) {
            this.objects = worldobjects;
            this.lastupdate = getTime();
        },

        /*
            Ein neues Update kam vom Server, nur der Player
        */
        updatePlayerFromServer: function(player) {
            this.objects = _.reject(this.objects, function(obj) { return obj.type == "player" && obj.name == player.name; });
            this.objects.push(player);
        },

        /*
             Clientseitiges Updaten der Physik und der Welt

             der aktuelle Spieler wird übergeben und zurückgegeben
        */
        update: function(playername) {
            var _this = this;

            var thistime = this.getServerTime();
            var secselapsed = (thistime - lasttime) / 1000;
            lasttime = thistime;

            var act = null;

            _.each(this.objects, function(obj) {

                gl.updateObj(_this.cfg, obj, secselapsed, _this.statics);

                if(obj.type == "player") {

                    _this.localPlayerFunctions(obj, secselapsed, thistime);

                    //ist es der aktuelle spieler
                    if(obj.name == playername) {
                        act = obj;
                    }
                }

            });

            _.each(this.localobjects, function(obj) {

                gl.updateObj(_this.cfg, obj, secselapsed, _this.statics);

            });


            // tote Objekte entfernen
            this.objects = _.reject(this.objects, function(obj) {
                return obj.dead || (obj.ad && (obj.t + (obj.ad * 1000) < thistime));
            });

            // tote lokale Objekte entfernen
            this.localobjects = _.reject(this.localobjects, function(obj) {
                return obj.dead || (obj.ad && (obj.t + (obj.ad * 1000) < thistime));
            });


            return act;

        },

        localPlayerFunctions: function(obj, secselapsed, thistime) {

            //todo: irgendwie muss das sauberer werden mit den particeln
            if(obj.thrusting || obj.breaking) {

                if(!obj.lastthrust || obj.lastthrust + 30 < thistime ) {

                    var r = 12;

                    var dist_h = 4;
                    var dist_v = 24;
                    if(obj.breaking) {
                        dist_h = 12;
                        dist_v = -3;
                    }

                    var va = gl.vector.angleAbs2vector(obj.va, dist_v);
                    var vp = gl.vector.angleAbs2vector(obj.va + 90, dist_h);

                    var scale = (2*r) / 30;

                    var particle = {
                        type: "thruster",

                        x: obj.x - va.x + vp.x,
                        y: obj.y - va.y + vp.y,
                        ma: obj.ma,
                        s: obj.s - 100,
                        t: thistime,
                        isanim: true,
                        ad: 0.3,
                        scale: scale
                    };

                    this.localobjects.push(particle);

                    var particle = {
                        type: "thruster",

                        x: obj.x - va.x - vp.x,
                        y: obj.y - va.y - vp.y,
                        ma: obj.ma,
                        s: obj.s - 100,
                        t: thistime,
                        isanim: true,
                        ad: 0.3,
                        scale: scale
                    };

                    this.localobjects.push(particle);

                    obj.lastthrust = thistime;

                }
            }

            if(obj.stopping) {

                if(!obj.lastthrust || obj.lastthrust + 30 < thistime ) {

                    var r = 6;

                    var va = gl.vector.angleAbs2vector(obj.va, 24);
                    var vp = gl.vector.angleAbs2vector(obj.va + 90, 4);

                    var scale = (2*r) / 30;
                    var s = obj.s - 200;
                    if(s < 0) { s=0; }

                    var particle = {
                        type: "thruster",

                        x: obj.x - va.x + vp.x,
                        y: obj.y - va.y + vp.y,
                        ma: obj.va - 30,
                        s: s,
                        t: thistime,
                        isanim: true,
                        ad: 0.2,
                        scale: scale
                    };

                    this.localobjects.push(particle);

                    particle = {
                        type: "thruster",

                        x: obj.x - va.x - vp.x,
                        y: obj.y - va.y - vp.y,
                        ma: obj.va + 30,
                        s: s,
                        t: thistime,
                        isanim: true,
                        ad: 0.2,
                        scale: scale
                    };

                    this.localobjects.push(particle);

                    obj.lastthrust = thistime;

                    va = gl.vector.angleAbs2vector(obj.va, -3);
                    vp = gl.vector.angleAbs2vector(obj.va + 90, 12);

                    particle = {
                        type: "thruster",

                        x: obj.x - va.x + vp.x,
                        y: obj.y - va.y + vp.y,
                        ma: obj.va + 210,
                        s: s,
                        t: thistime,
                        isanim: true,
                        ad: 0.2,
                        scale: scale
                    };

                    this.localobjects.push(particle);

                    particle = {
                        type: "thruster",

                        x: obj.x - va.x - vp.x,
                        y: obj.y - va.y - vp.y,
                        ma: obj.va - 210,
                        s: s,
                        t: thistime,
                        isanim: true,
                        ad: 0.2,
                        scale: scale
                    };

                    this.localobjects.push(particle);

                    obj.lastthrust = thistime;

                }
            }

        }



    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
}});