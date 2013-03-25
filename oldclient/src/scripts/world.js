define(["lodash"], function(_) { return function(name) {
    var obj = {

        objects: [],
        worldfunctions: null,
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
        },


        // -------------------------------------------- CLIENT-WORLD-CALCULATIONS ----------------------------------------
        update: function() {
            var _this = this;

            var thistime = Date.now();
            var secselapsed = (thistime - this.lastupdate) / 1000;
            this.lastupdate = thistime;


            if (this.worldfunctions) {

                _.each(this.objects, function(obj) {
                    _this.worldfunctions.updateObj(obj, _this.statics, secselapsed);
                });

            }
        }
        // --------------------------------------------

    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
}});