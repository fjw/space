define(["underscore", "jquery", "rafpolyfill", "world"], function(_, $, rafpolyfill, WORLD) { return function() {
var obj = {

    //--------------------
    bgcanvas: null,
    bgctx: null,
    vgcanvas: null,
    vgctx: null,
    cw: 0,
    ch: 0,

    mx: 0,
    my: 0,
    //--------------------

    world: null,
    playername: null,
    player: null,
    oldtranslation: {x:0,y:0},

    started: false,

    _init: function() {
        //einrichten und Listener starten... geloopt wird erst später

        var _this = this;

        //Canvas einrichten
        this.bgcanvas = $("#bg")[0];
        this.bgctx = this.bgcanvas.getContext("2d");
        this.vgcanvas = $("#vg")[0];
        this.vgctx = this.vgcanvas.getContext("2d");

        //this.bgctx.translate(0.5, 0.5);
        //this.vgctx.translate(0.5, 0.5);

        //inital einen resize triggern
        this._onResize();

        // ------------------------------------------------

        this.world = new WORLD("myworld");


        // ------------------------------------------------

        socket.on("initial", function(data) {
            _this.playername = data.playername;
        });

        socket.on("worldupdate", function(worldobjects) {

            _this.world.updateFromServer(worldobjects);

            _this.player = _.find(worldobjects, function(obj) { return obj.type == "player" && obj.name == _this.playername; });

            //Koordinatensystem transformieren
            var xx = Math.floor(_this.player.x + _this.mx);
            var yy = Math.floor(_this.player.y + _this.my);

            _this.vgctx.translate( xx - _this.oldtranslation.x, yy - _this.oldtranslation.y );

            _this.oldtranslation.x = xx;
            _this.oldtranslation.y = yy;
        });

        // ------------------------------------------------
        window.onresize = function() { _this._onResize(); };
        window.onkeydown = function(e) { _this._onKeydown(e.keyCode); };
        window.onkeyup = function(e) { _this._onKeyup(e.keyCode); };
        window.onblur = function() { _this._onBlur(); };
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

        var w = window.innerWidth;
        var h = window.innerHeight;

        this.bgcanvas.width = w;
        this.bgcanvas.height = h;
        this.vgcanvas.width = w;
        this.vgcanvas.height = h;
        this.cw = w;
        this.ch = h;

        this.mx = Math.floor(w / 2);
        this.my = Math.floor(h / 2);

        this.vgctx.translate( this.oldtranslation.x, this.oldtranslation.y );
        console.log(this.oldtranslation);
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
        this.vgctx.clearRect(0, 0, this.cw, this.ch);

        _this.vgctx.fillStyle = "#000";
        _.each(this.world.objects, function(obj) {
            _this.vgctx.fillRect(Math.floor(obj.x), Math.floor(obj.y), 10, 10);
        });


        //clientside-World-Berechnung
        this.world.update();
    }







};
//mach den _init und gib das objekt aus
obj._init();
return obj;
};});