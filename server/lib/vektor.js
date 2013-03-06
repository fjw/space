exports = module.exports = function(x, y) {
var obj = {

    x: 0,
    y: 0,

    _init: function(x, y) {
        this.x = x;
        this.y = y;
    },

    _angleProp: null,
    angle: function() { //in radians
        if (!this._angleProp) {
            this._angleProp = Math.acos(this.y / this.abs()) * Math.PI / 180;
        }
        return this._angleProp;
    },

    _absProp: null,
    abs: function() {
        if (!this._absProp) {
            this._absProp = Math.sqrt(this.x*this.x + this.y*this.y);
        }
        return this._absProp;
    },

    _normProp: null,
    norm: function() {
        if (!this._normProp) {
            this._normProp = {
                x: this.x / this.abs(),
                y: this.y / this.abs()
            };
        }
        return this._normProp;
    }





};
//mach den _init und gib das objekt aus
obj._init(x, y);
return obj;
};