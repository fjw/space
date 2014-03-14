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
        statics: [],

        lastupdate: getTime(),

        cfg: {},

        _init: function(name) {
            //name = Worldname

        },

        getTime: function() {
            return getTime();
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

            var thistime = getTime();
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


            // tote Objekte entfernen
            this.objects = _.reject(this.objects, function(obj) {
                return obj.dead || (obj.ad && (obj.t + (obj.ad * 1000) < thistime));
            });


            return act;

        },

        localPlayerFunctions: function(obj, secselapsed, thistime) {

            if(obj.thrusting || obj.breaking) {

                if(!obj.lastthrust || obj.lastthrust + 30 < thistime ) {


                    var r = 12;

                    var dist_h = 4;
                    var dist_v = 20;
                    if(obj.breaking) {
                        dist_h = 12;
                        dist_v = 0;
                    }

                    var va = gl.vector.angleAbs2vector(obj.va, dist_v);
                    var vp = gl.vector.angleAbs2vector(obj.va + 90, dist_h);

                    var particle = {
                        type: "thruster",

                        x: obj.x - va.x + vp.x,
                        y: obj.y - va.y + vp.y,
                        ma: obj.va,
                        s: 100,
                        o: obj.name,
                        cr: r,
                        t: thistime,
                        isanim: true,
                        ad: 0.3,
                        scale: (2*r) / 30
                    };

                    this.objects.push(particle);


                    var particle = {
                        type: "thruster",

                        x: obj.x - va.x - vp.x,
                        y: obj.y - va.y - vp.y,
                        ma: obj.va,
                        s: 100,
                        o: obj.name,
                        cr: r,
                        t: thistime,
                        isanim: true,
                        ad: 0.3,
                        scale: (2*r) / 30
                    };

                    this.objects.push(particle);

                    obj.lastthrust = thistime;

                }
            }
        }

    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
}});