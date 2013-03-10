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
            /*
            {
                type: "walltest",
                x:-300, y:-300,       //Koordinaten
                w: 2000, h: 2000,   //Größe   //todo: w,h aus image holen
                cp: [   //Kollisionspfade
                    { x1: 30,    y1: 30,    x2: 1970, y2: 30 },
                    { x1: 1970,  y1: 30,    x2: 1970, y2: 1970 },
                    { x1: 1970,  y1: 1970,  x2: 30,    y2: 1970 },
                    { x1: 30,    y1: 1970,  x2: 30,    y2: 30 }
                ]
            },*/
            {
                type: "ni", // Wand ohne Bild
                x: 100, y: 100,
                p: [ // Geschlossender Pfad, Kollisionspfad wird automatisch generiert
                    { x: 0, y:0 },
                    { x: 100, y: 0 },
                    { x: 100, y: 100 },
                    { x: 0, y: 100 }
                ],
                c: "#f00"
            },

            //Seitenwände
            {
                type: "ni", x: -2000, y: -2000,
                p: [ { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 4000 }, { x: 0, y: 4000 } ],
                c: "#00f"
            },
            {
                type: "ni", x: -2000, y: -2000,
                p: [ { x: 0, y: 0 }, { x: 4000, y: 0 }, { x: 4000, y: 10 }, { x: 0, y: 10 } ],
                c: "#00f"
            },
            {
                type: "ni", x: 1990, y: -2000,
                p: [ { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 4000 }, { x: 0, y: 4000 } ],
                c: "#00f"
            },
            {
                type: "ni", x: -2000, y: 1990,
                p: [ { x: 0, y: 0 }, { x: 4000, y: 0 }, { x: 4000, y: 10 }, { x: 0, y: 10 } ],
                c: "#00f"
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

                if (static.p) {
                    //Kollisionspfade aus Punktpfaden erzeugen

                    var cps = [];
                    for(var i = 0; i < static.p.length - 1; i++) {
                        cps.push({
                            x1: static.p[i].x,
                            y1: static.p[i].y,
                            x2: static.p[i+1].x,
                            y2: static.p[i+1].y
                        });
                    }
                    cps.push({
                        x1: static.p[static.p.length - 1].x,
                        y1: static.p[static.p.length - 1].y,
                        x2: static.p[0].x,
                        y2: static.p[0].y
                    });
                    if (static.cp) {
                        static.cp = static.cp.concat(cps);
                    } else {
                        static.cp = cps;
                    }

                    //Maximum bei Punktpfaden ermitteln
                    if (!static.w || !static.h) {

                        static.w = _.max(static.p, function(item){ return item.x; }).x;
                        static.h = _.max(static.p, function(item){ return item.y; }).y;

                    }
                }

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