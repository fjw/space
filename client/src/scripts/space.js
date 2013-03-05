define(["underscore", "jquery", "rafpolyfill"], function(_, $, rafpolyfill) { return function() {
var obj = {

    //--------------------
    bgcanvas: null,
    bgctx: null,
    vgcanvas: null,
    vgctx: null,
    w: null,
    h: null,
    //--------------------

    objects: [],

    started: false,

    _init: function() {
        //einrichten und Listener starten... geloopt wird erst später

        var _this = this;

        //Canvas einrichten
        this.bgcanvas = $("#bg")[0];
        this.bgctx = this.bgcanvas.getContext("2d");
        this.vgcanvas = $("#vg")[0];
        this.vgctx = this.vgcanvas.getContext("2d");

        this.bgctx.translate(0.5, 0.5);
        this.vgctx.translate(0.5, 0.5);

        //inital einen resize triggern
        this._onResize();

        // ------------------------------------------------

        socket.on("initial", function(data) {

        });

        // ------------------------------------------------
        window.onresize = function()     { _this._onResize(); };

        window.onkeydown = function(e)   { _this._onKeydown(e.keyCode); };
        window.onkeyup = function(e)     { _this._onKeyup(e.keyCode); };
        window.onblur = function(e)      { _this._onBlur(); }
        // ------------------------------------------------
    },


    start: function() {
        var _this = this;

        //Loop starten
        (function animloop(){
            requestAnimationFrame(animloop);
            _this._update();
        })();

        this.started = true;
    },


    _onResize: function() {

        var w = $(window).width();
        var h = $(window).height();

        this.bgcanvas.width = w;
        this.bgcanvas.height = h;
        this.vgcanvas.width = w;
        this.vgcanvas.height = h;
        this.w = w;
        this.h = h;
    },

    _onBlur: function() {
        this._flushKeys();
    },

    _keysdown: [],
    _onKeydown: function(code) {

        if (!this._keysdown[code]) {
            this._keysdown[code] = true;

            if(code == 38) { socket.emit("thrust", "start"); }
            if(code == 40) { socket.emit("break", "start"); }
            if(code == 39) { socket.emit("tright", "start"); }
            if(code == 37) { socket.emit("tleft", "start"); }

        }


    },

    _onKeyup: function(code) {
        this._keysdown[code] = false;

        if(code == 38) { socket.emit("thrust", "stop"); }
        if(code == 40) { socket.emit("break", "stop"); }
        if(code == 39) { socket.emit("tright", "stop"); }
        if(code == 37) { socket.emit("tleft", "stop"); }

    },

    _flushKeys: function() {

        this._keysdown = [];

        socket.emit("allsystems", "stop");
    },

    _update: function() {
        var _this = this;


        //clear
        this.vgctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    }







};
//mach den _init und gib das objekt aus
obj._init();
return obj;
};});