exports = module.exports = function(collection, worldname) {
    var obj = {

        // ------------

        dbc: null,
        name: null,

        // ------------

        statics: [],


        // ------------------------------------------------------------
        // ------------------------------------------------------------

        /*
            Konstruktor & Einstellungen
         */
        _init: function(collection, worldname) {

            this.dbc = collection;     //DB-Collection
            this.name = worldname;   //Name der Welt


            var map = require( __dirname + "/../maps/"+worldname+".js");  //Map-Einstellungen

            this._loadStatics(map);


        },

        /*
            Für den Main-Loop, wird vom Worldserver aufgerufen
         */
        update: function() {

            this.dbc.find({}).each(function(err, doc) {
            });
        },

        /*
            Löscht alle Objekte aus der Welt
        */
        purge: function() {
            this.dbc.remove();
        },

        // ------------------------------------------------------------
        // ------------------------------------------------------------

        /*
            bereitet aus dem Mapfile geladene statics für die Verarbeitung vor
         */
        _loadStatics: function(map) {
            var countCps = 0;

            for (var i = 0, len = map.statics.length; i < len; i++) {
                var stc = map.statics[i];


                // Breite und Höhe bestimmen falls nicht angegeben
                if((!stc.w || !stc.h) && stc.ps) {
                    var max = 0;
                    var may = 0;
                    stc.ps.forEach(function(p) {
                        p.forEach(function(v) {
                            if (v.x > max) { max = v.x; }
                            if (v.y > may) { may = v.y; }
                        });
                    });

                    stc.w = max;
                    stc.h = may;
                }


                // Kollisionsvektoren bilden
                if(stc.ps) {
                    var cps = [];

                    stc.ps.forEach(function(p) {

                        var plen = p.length;
                        for(var i = 0; i < plen - 1; i++) {
                            cps.push({
                                x1: p[i].x,
                                y1: p[i].y,
                                x2: p[i+1].x,
                                y2: p[i+1].y
                            });
                        }
                        cps.push({
                            x1: p[plen - 1].x,
                            y1: p[plen - 1].y,
                            x2: p[0].x,
                            y2: p[0].y
                        });

                    });

                    if(stc.cps) {
                        stc.cps = stc.cps.concat(cps);
                    } else {
                        stc.cps = cps;
                    }

                }


                if (stc.cps) {
                    // Winkel der Collisionsvektoren ausrechnen
                    stc.cps.forEach(function(item) {
                       item.a = vector.directionlessAngle(vector.vector2angleAbs(item.x2 - item.x1, item.y2 - item.y1).a);
                    });

                    //Zählen
                    countCps += stc.cps.length;
                }



                //Einfügen
                this.statics.push(stc);
            }

            log("info", this.statics.length + " statics objects loaded, " + countCps + " collisionpaths");

        }


    };

    //mach den _init und gib das objekt aus
    obj._init(collection, worldname);
    return obj;
};