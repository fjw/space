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

        updateFromServer: function(worldobjects) {
            this.objects = this.localobjects.concat(worldobjects);

            this.lastupdate = Date.now();
        },

        update: function(playername) {
            /*
                Clientseitiges Updaten der Physik und der Welt

                der aktuelle Spieler wird übergeben und zurückgegeben
             */

            var thistime = Date.now();
            var secselapsed = (thistime - this.lastupdate) / 1000;
            this.lastupdate = thistime;


            var act = null;

            _.each(this.objects, function(obj) {

                gl.updateObj(this.cfg, obj, secselapsed, this.actionstack);

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