exports = module.exports = function(collection, worldname) {
    var obj = {

        dbc: null,
        name: null,
        map: null,

        /*
            Konstruktor & Einstellungen
         */
        _init: function(collection, worldname) {

            this.dbc = dbc;     //DB-Collection
            this.name = name;   //Name der Welt
            this.map = require( __dirname + "/../maps/"+worldname+".js");  //Map-Einstellungen

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

        }


    };

    //mach den _init und gib das objekt aus
    obj._init(collection, worldname);
    return obj;
};