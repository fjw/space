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

        _loadStatics: function(map) {


            for (var i = 0, len = map.statics.length; i < len; i++) {
                var stc = map.statics[i];


                // Breite und Höhe bestimmen falls nicht angegeben
                if((!stc.w || !stc.h) && stc.ps) {
                    var max = 0;
                    var may = 0;
                    stc.pis.each(function(p) {
                        p.each(function(v) {
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

                    stc.ps.each(function(p) {


                    });


                }


            }

        }


    };

    //mach den _init und gib das objekt aus
    obj._init(collection, worldname);
    return obj;
};