define(["lodash"], function(_) { return function(name) {
    var obj = {

        objects: [],
        statics: [],

        localobjects: [

        ],

        lastupdate: Date.now(),

        _init: function(name) {
            //name = Worldname

        },

        updateFromServer: function(worldobjects) {
            this.objects = this.localobjects.concat(worldobjects);

            this.lastupdate = Date.now();
        }

    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
}});