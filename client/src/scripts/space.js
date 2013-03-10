define(["underscore", "jquery", "rafpolyfill", "world", "res"], function(_, $, rafpolyfill, WORLD, RES) { return function() {
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
    res: null,

    playername: null,
    player: null,

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

        this.world = new WORLD("myworld");
        this.res = new RES();

        // ------------------------------------------------

        socket.on("initial", function(data) {
            //register playername
            _this.playername = data.playername;

            //register statics
            _this.world.statics = data.statics;

            //register worldfunctions
            var wf = function() {
                eval(data.worldfunctions);
                return { updateObj: updateObj };
            };

            _this.world.worldfunctions = wf();
        });

        socket.on("worldupdate", function(worldobjects) {
            _this.world.updateFromServer(worldobjects);
            _this.player = _.find(worldobjects, function(obj) { return obj.type == "player" && obj.name == _this.playername; });
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
            if(code == 78) { socket.emit("breaktostop", "start"); }

        }


    },

    _onKeyup: function(code) {
        this._keysdown[code] = false;

        if(code == 38) { socket.emit("thrust", "stop"); }
        if(code == 40) { socket.emit("break", "stop"); }
        if(code == 39) { socket.emit("tright", "stop"); }
        if(code == 37) { socket.emit("tleft", "stop"); }
        if(code == 78) { socket.emit("breaktostop", "stop"); }

    },

    _flushKeys: function() {

        this._keysdown = [];

        socket.emit("allsystems", "stop");
    },

    _update: function() {
        var _this = this;



        //clear
        this.vgctx.clearRect(0, 0, this.cw, this.ch);
        this.bgctx.clearRect(0, 0, this.cw, this.ch);


        // ----- Operationen mit Welt-Koordinaten -----
        this.vgctx.save();

        if (this.player) {
            //Koordinatensystem transformieren
            var xx = Math.round(this.mx - this.player.x);
            var yy = Math.round(this.my - this.player.y);

            this.vgctx.translate(  xx, yy );
        }


        _.each(this.world.statics, function(obj) {


            _this.res.drawSprite(_this.vgctx, obj.type, obj.x, obj.y);

        });

        this.vgctx.fillStyle = "#444";
        _.each(this.world.objects, function(obj) {

            if (obj.type == "player") {

                _this.res.drawSprite(_this.vgctx, obj.type, obj.x, obj.y, obj.va);

            } else {
                _this.vgctx.fillRect(Math.round(obj.x) - 3, Math.round(obj.y) - 3, 6, 6);
            }

            if (window.debug) {
                //zeichne vektor
                var vx = Math.cos((obj.ma-90) * 0.0174532) * obj.s * 0.5;
                var vy = Math.sin((obj.ma-90) * 0.0174532) * obj.s * 0.5;
                _this.vgctx.beginPath();
                _this.vgctx.moveTo(obj.x, obj.y);
                _this.vgctx.lineTo(obj.x + vx, obj.y + vy);
                _this.vgctx.strokeStyle = "#f00";
                _this.vgctx.stroke();
            }

        });

        this.vgctx.restore();
        // -----

        this.bgctx.fillStyle = "#f00";
        this.bgctx.fillRect(_this.mx - 1, _this.my - 1, 2, 2);

        //clientside-World-Berechnung
        this.world.update();
    }






};
//mach den _init und gib das objekt aus
obj._init();
return obj;
};});