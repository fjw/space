exports = module.exports = function() {

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
                cr: 18          //Kollisionsradius
            },
            { type: "player", name: "anderor",x: 100, y: 0,  ma: 225,  s: 20, va: 225,  cr: 18  }
        ],

        statics: [
            {
                type: "walltest",
                x:-300, y:-300,       //Koordinaten
                w: 2000, h: 2000,   //Größe   //todo: w,h aus image holen
                cp: [   //Kollisionspfade
                    { x1: 30,    y1: 30,    x2: 1970, y2: 30 },
                    { x1: 1970,  y1: 30,    x2: 1970, y2: 1970 },
                    { x1: 1970,  y1: 1970,  x2: 30,    y2: 1970 },
                    { x1: 30,    y1: 1970,  x2: 30,    y2: 30 }
                ],
                bf: 0.9 //Bouncefaktor
            }
        ],

        lastupdate: Date.now(),

        worldfunctions: require( __dirname + "/worldfunctions.js")(),

        _init: function() {



            this._prepareStatics();


        },

        _prepareStatics: function() {
            var _this = this;

            _.each(this.statics, function(static) {

                _.each(static.cp, function(cp) {

                    // Berechne die Winkel der Statics-Collisionpaths
                    cp.a = _this.worldfunctions.directionlessAngle(_this.worldfunctions.vector2angleAbs(cp.x2-cp.x1, cp.y2-cp.y1).a);

                });

            });

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
    obj._init();
    return obj;
};