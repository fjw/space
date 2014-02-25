define(["lodash", "gamelogic"], function(_, gl) { return function(name) {
    var obj = {

        objects: [],
        statics: [],

        localobjects: [

        ],

        lastupdate: Date.now(),

        cfg: {},

        actionstack: {},

        _init: function(name) {
            //name = Worldname

        },

        setPlayerAction: function(playername, action) {
            var ao = this.actionstack[playername];

            if(!ao) {
                ao = {};
            }

            ao = gl.actionCode2actionStackObject(action, ao);

            if(ao) {
                this.actionstack[playername] = ao;
            }

        },

        /*
             Ein neues Update kam vom Server
         */
        updateFromServer: function(worldobjects) {
            //TEST DIFFERENZ

            /*
            var w_player = _.find(worldobjects, function(obj) { return obj.type == "player" && obj.name == "user"; });
            var c_player = _.find(this.objects, function(obj) { return obj.type == "player" && obj.name == "user"; });

            if(w_player && c_player) {

                for(var key in w_player) {

                    if(key != "x" && key != "y" && w_player[key] && c_player[key] && w_player[key] != c_player[key]) {

                        console.log("w." + key + "=" + w_player[key]);
                        console.log("c." + key + "=" + c_player[key]);

                    }

                }

            }
            */


            this.objects = this.localobjects.concat(worldobjects);

            this.lastupdate = Date.now();

        },

        /*
             Clientseitiges Updaten der Physik und der Welt

             der aktuelle Spieler wird übergeben und zurückgegeben
         */
        update: function(playername, latency) {
            var _this = this;

            if(!latency) { latency = 0; }

            var thistime = Date.now(); // + latency;
            var secselapsed = (thistime - this.lastupdate) / 1000;
            this.lastupdate = thistime;


            var act = null;

            _.each(this.objects, function(obj) {

                gl.updateObj(_this.cfg, obj, secselapsed, _this.actionstack);

                //ist es der aktuelle spieler
                if(obj.type == "player" && obj.name == playername) {
                    act = obj;
                }

            });

            //actionstack leeren
            this.actionstack = {};

            return act;

        }

    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
}});