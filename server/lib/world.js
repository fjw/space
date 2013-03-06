exports = module.exports = function(name) {

    var obj = {

        objects: [
            { type: "bullet",                 x: 50,  y: 10, ma: 0,    s: 0  },
            { type: "player", name: "testor", x: 5,   y: 10, ma: 0,    s: 0, va: 135  },
            { type: "player", name: "anderor",x: 100, y: 0,  ma: 225,  s: 20, va: 225 }
        ],

        lastupdate: Date.now(),

        worldfunctions: require( __dirname + "/worldfunctions.js")(),

        _init: function(name) {

            console.log(name);
        },

        // ============================================ SERVER-WORLD-CALCULATIONS ============================================
        update: function() {
            var _this = this;

            var thistime = Date.now();
            var secselapsed = (thistime - this.lastupdate) / 1000;
            this.lastupdate = thistime;


            _.each(this.objects, function(obj) {
                _this.worldfunctions.updateObj(obj, secselapsed);
            });
        }
        // ============================================

    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
};