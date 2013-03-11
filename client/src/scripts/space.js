define(["underscore", "jquery", "rafpolyfill", "world", "res"], function(_, $, rafpolyfill, WORLD, RES) { return function() {
var obj = {

    //--------------------
    bgcanvas: null,
    bgctx: null,
    vgcanvas: null,
    vgctx: null,
    mapcanvas: null,
    mapctx: null,

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
    initiated: false,

    _init: function() {
        //einrichten und Listener starten... geloopt wird erst später

        var _this = this;

        //Canvas einrichten
        this.bgcanvas = $("#bg")[0];
        this.bgctx = this.bgcanvas.getContext("2d");
        this.vgcanvas = $("#vg")[0];
        this.vgctx = this.vgcanvas.getContext("2d");
        this.mapcanvas = $("#map")[0];
        this.mapctx = this.mapcanvas.getContext("2d");

        this.bgctx.translate(0.5, 0.5);
        this.vgctx.translate(0.5, 0.5);
        this.mapctx.translate(0.5, 0.5);


        //inital einen resize triggern
        this._onResize();


        // ------------------------------------------------

        this.world = new WORLD("myworld");
        this.res = new RES();

        // ------------------------------------------------

        socket.on("initial", function(data) {

            if (_this.initiated) {
                //wurde schonmal gestartet, Server restart? => Reload Page
                document.location.reload(true);
            }
            _this.initiated = true;


            //register playername
            _this.playername = data.playername;

            //register statics
            _this.world.statics = data.statics;

            _this._prepareMinimap();

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

        this.mapcanvas.width = 0.2 * w;
        this.mapcanvas.height = 0.2 * h;

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
            if(code == 32) { socket.emit("shoot", "start"); }
            if(code == 225) { socket.emit("shoot2", "start"); }

        }


    },

    _onKeyup: function(code) {
        this._keysdown[code] = false;

        if(code == 38) { socket.emit("thrust", "stop"); }
        if(code == 40) { socket.emit("break", "stop"); }
        if(code == 39) { socket.emit("tright", "stop"); }
        if(code == 37) { socket.emit("tleft", "stop"); }
        if(code == 78) { socket.emit("breaktostop", "stop"); }
        if(code == 32) { socket.emit("shoot", "stop"); }
        if(code == 225) { socket.emit("shoot2", "stop"); }

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

            if(obj.type == "ni") {

                // Static ohne Bild mit Pfad
                _this.vgctx.beginPath();

                _.each(obj.p, function(p, i) {
                    if( i == 0 ) {
                        _this.vgctx.moveTo(p.x + obj.x, p.y + obj.y);
                    } else {
                        _this.vgctx.lineTo(p.x + obj.x, p.y + obj.y);
                    }
                });
                _this.vgctx.closePath();
                _this.vgctx.fillStyle = obj.c;
                _this.vgctx.fill();

            } else {

                // Static mit Bild
                _this.res.drawSprite(_this.vgctx, obj.type, obj.x, obj.y, 0, true);

            }

        });

        this.vgctx.fillStyle = "#444";
        _.each(this.world.objects, function(obj) {


            if (obj.type != "player" || obj.name != _this.playername) { //aktuellen Spieler nicht zeichnen

                _this.res.drawSprite(_this.vgctx, obj.type, obj.x, obj.y, obj.va);

            }

            // ---- Debug Vektoren
            if (window.debug >= 2) {
                //zeichne vektor
                var vx = Math.cos((obj.ma-90) * 0.0174532) * obj.s * 0.5;
                var vy = Math.sin((obj.ma-90) * 0.0174532) * obj.s * 0.5;
                _this.vgctx.beginPath();
                _this.vgctx.moveTo(obj.x, obj.y);
                _this.vgctx.lineTo(obj.x + vx, obj.y + vy);
                _this.vgctx.strokeStyle = "#f00";
                _this.vgctx.stroke();
            }
            // ----

        });

        //aktuellen Spieler zeichnen
        this.res.drawSprite(this.vgctx, "player", this.player.x, this.player.y, this.player.va);


        //Vordergrund statics zeichnen //todo: gescheites layersystem muss her
        _.each(this.world.statics, function(obj) {

            if (obj.type != "ni") {

                // Static mit Bild
                _this.res.drawSprite(_this.vgctx, obj.type, obj.x, obj.y, 0, false);

            }

        });




        this.vgctx.restore();
        // -----

        this.updateMinimap();

        // -----

        //clientside-World-Berechnung
        this.world.update();
    },


    updateMinimap: function() {

        // Minimap updaten //todo: Hier kann Perfomance gespart werden z.B. nur jedes 10 Frame rendern
        this.mapctx.clearRect(0, 0, this.mapcanvas.width, this.mapcanvas.height);

        var mx = Math.round((this.player.x - this._mapX) * this.zoom);
        var my = Math.round((this.player.y - this._mapY) * this.zoom);
        var px = Math.round(this.mapcanvas.width / 2);
        var py = Math.round(this.mapcanvas.height / 2);

        this.mapctx.drawImage(this._mapbuffer, px - mx, py - my);

        // Mittelpunkt
        this.mapctx.fillStyle = "#f00";
        this.mapctx.fillRect(px - 1, py - 1, 3, 3);

        // Rahmen
        var cw = Math.round(this.cw * this.zoom);
        var ch = Math.round(this.ch * this.zoom);
        this.mapctx.strokeStyle = "#222";
        this.mapctx.strokeRect(px - Math.round(cw / 2), py - Math.round(ch / 2), cw, ch );

    },

    zoom: 0.05,
    _mapX: 0,
    _mapY: 0,
    _mapbuffer: null,
    _prepareMinimap: function() { //todo: diese Function refakturisieren
        var _this = this;

        var zoom = this.zoom;
        var max_x = _.max(this.world.statics, function(item) { return item.x + item.w; });
        var max_y = _.max(this.world.statics, function(item) { return item.y + item.h; });
        var min_x = _.min(this.world.statics, function(item) { return item.x; });
        var min_y = _.min(this.world.statics, function(item) { return item.y; });

        var w = max_x.x + max_x.w - min_x.x;
        var h = max_y.y + max_y.h - min_y.y;

        var mx = min_x.x;
        var my = min_y.y;

        this._mapX = mx;
        this._mapY = my;

        this._mapbuffer = document.createElement("canvas");
        var mctx = this._mapbuffer.getContext("2d");
        this._mapbuffer.width = w * zoom;
        this._mapbuffer.height = h * zoom;


        _.each(this.world.statics, function(obj) {

            if(obj.type == "ni") {

                // Static ohne Bild mit Pfad
                mctx.beginPath();

                _.each(obj.p, function(p, i) {
                    if( i == 0 ) {
                        mctx.moveTo( (p.x + obj.x - mx)*zoom, (p.y + obj.y - my)*zoom);
                    } else {
                        mctx.lineTo( (p.x + obj.x - mx)*zoom, (p.y + obj.y - my)*zoom);
                    }
                });
               mctx.closePath();
               mctx.fillStyle = obj.c;
               mctx.fill();

            } else {


                // Static mit Bild
                _this.res.drawSprite(mctx,  obj.type, (obj.x - mx), (obj.y - my), 0, false, zoom);
            }

        });

    }



};
//mach den _init und gib das objekt aus
obj._init();
return obj;
};});