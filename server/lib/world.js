exports = module.exports = function(name) {

    var obj = {

        objects: [
            {
                type: "bullet",
                x: 50, y: 10,   //Koordinaten
                ma: 0,          //Bewegungswinkel
                s: 0            //Speed
            },
            {
                type: "player", name: "testor",
                x: 5, y: 10,    //Koordinaten
                ma: 0,          //Bewegungswinkel
                s: 0,           //Speed
                va: 135,        //Sichtwinkel
                cr: 36          //Kollisionsradius
            },
            { type: "player", name: "anderor",x: 100, y: 0,  ma: 225,  s: 20, va: 225,  cr: 36  }
        ],

        statics: [
            {
                type: "walltest",
                x:300, y:300,       //Koordinaten
                w: 2000, h: 2000,   //Größe   //todo: w,h aus image holen
                cp: [   //Kollisionspfade
                    { x1: 0,    y1: 0,    x2: 2000, y2: 0 },
                    { x1: 2000, y1: 0,    x2: 2000, y2: 2000 },
                    { x1: 2000, y1: 2000, x2: 0,    y2: 2000 },
                    { x1: 0,    y1: 2000, x2: 0,    y2: 0 }
                ]
            }
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
                _this.worldfunctions.updateObj(obj, _this.statics, secselapsed);
            });
        }
        // ============================================

    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
};