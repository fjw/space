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

    var obj = {

        objects: [],
        statics: [],

        localobjects: [

        ],

        lastupdate: getTime(),

        cfg: {},

        astack: {},

        _init: function(name) {
            //name = Worldname

        },

        setPlayerAction: function(playername, action, num) {
/*
            var playeractionstack = this.astack[playername];

            if(!playeractionstack) {
                playeractionstack = [];
            }

            playeractionstack.push({ action: action, num: num });

            this.astack[playername] = playeractionstack;
*/
        },

        /*
             Ein neues Update kam vom Server
         */
        updateFromServer: function(worldobjects, oldplayer, playername) {

            var newplayer = _.find(worldobjects, function(obj) { return obj.type == "player" && obj.name == playername; });

            /*
            if(oldplayer) {

                // Änderungen am Spieler nur, wenn noch nicht lokal durchgeführt
                if(newplayer.lastaction < oldplayer.lastaction) {


                    //Werte nicht annehmen
                    var keys = ["thrusting",
                                "breaking",
                                "rturning",
                                "lturning",
                                "stopping",
                                "shooting",
                                "shooting2"];

                    _.each(keys, function(key) {
                        if(newplayer[key] != oldplayer[key]) {
                            newplayer[key] = oldplayer[key];
                        }
                    });

                    //Werte interpolieren
                    var keys = ["va",
                                "ma",
                                "s",
                                "x", "y"];

                    _.each(keys, function(key) {
                        if(newplayer[key] != oldplayer[key]) {
                            newplayer[key] = (oldplayer[key] + newplayer[key]) / 2;
                        }
                    });

                }
            }
            */

            this.objects = this.localobjects.concat(worldobjects);

            this.lastupdate = getTime();

            return newplayer;
        },

        /*
             Clientseitiges Updaten der Physik und der Welt

             der aktuelle Spieler wird übergeben und zurückgegeben
         */
        update: function(playername, latency) {
            var _this = this;

            if(!latency) { latency = 0; } //todo: saubermachen

            var thistime = getTime(); // + latency; //todo: saubermachen
            var secselapsed = (thistime - this.lastupdate) / 1000;
            this.lastupdate = thistime;


            var act = null;

            _.each(this.objects, function(obj) {

                gl.updateObj(_this.cfg, obj, secselapsed, _this.astack); //todo: saubermachen

                //ist es der aktuelle spieler
                if(obj.type == "player" && obj.name == playername) {
                    act = obj;
                }

            });

            //actionstack leeren
            this.astack = {};

            return act;

        }

    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
}});