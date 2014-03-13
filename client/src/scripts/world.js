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

        localobjects: [

        ],

        lastupdate: getTime(),

        cfg: {},

        _init: function(name) {
            //name = Worldname

        },


        /*
             Ein neues Update kam vom Server
        */
        updateFromServer: function(worldobjects) {
            this.objects = this.localobjects.concat(worldobjects);
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

                //ist es der aktuelle spieler
                if(obj.type == "player" && obj.name == playername) {
                    act = obj;
                }

            });


            return act;

        }

    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
}});