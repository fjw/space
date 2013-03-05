define(["underscore"], function(_) { return function(name) {
    var obj = {

        objects: [],
        player: null,

        lastupdate: Date.now(),

        _init: function(name) {

            console.log(name);
        },

        updateFromServer: function(worldobjects) {
            this.objects = worldobjects;
            this.lastupdate = Date.now();
        },


        // -------------------------------------------- CLIENT-WORLD-CALCULATIONS ----------------------------------------
        update: function() {
            var _this = this;

            var thistime = Date.now();
            var secselapsed = (thistime - this.lastupdate) / 1000;
            this.lastupdate = thistime;


            _.each(this.objects, function(obj) {
                _this._updateObjPosition(obj, secselapsed);
            });
        },

        _updateObjPosition: function(obj, secselapsed) {

            //dx = x-Änderung pro Sec
            obj.x += obj.dx * secselapsed;
            obj.y += obj.dy * secselapsed;

        }
        // --------------------------------------------

    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
}});