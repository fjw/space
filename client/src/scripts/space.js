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

        socket.on("initial", function(pdata) {

        });

        // ------------------------------------------------
        window.onresize = function()     { _this._onResize(); };
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