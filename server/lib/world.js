exports = module.exports = function(name) {

    var obj = {

        objects: [
            { type: "bullet",                 x: 50,  y: 10, dx: 1, dy: 0 },
            { type: "player", name: "testor", x: 5,   y: 10, dx: 1, dy: 0 },
            { type: "player", name: "anderor",x: 100, y: 0, dx: 0, dy: 0 }
        ],

        lastupdate: Date.now(),

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
                _this._updateObjPosition(obj, secselapsed);
            });
        },

        _updateObjPosition: function(obj, secselapsed) {

            //dx = x-Änderung pro Sec
            obj.x += obj.dx * secselapsed;
            obj.y += obj.dy * secselapsed;

        }
        // ============================================

    };

    //mach den _init und gib das objekt aus
    obj._init(name);
    return obj;
};