define(["lodash", "jquery", "rafpolyfill", "world", "ftools"], function(_, $, rafpolyfill, WORLD, ft) { return function() {
var obj = {

    //--------------------
    layers: [],
    ctxs: [],
    mapcanvas: null,
    mapctx: null,


    canvas: null,
    ctx: null,

    cw: 0,
    ch: 0,

    mx: 0,
    my: 0,
    //--------------------

    world: null,

    playername: null,
    player: null,

    started: false,
    initiated: false,

    //---------------------------
    _fpsInterval: null,
    _countFrames: 0,
    fps: 0,
    //---------------------------

    _init: function() {
        var _this = this;

        //einrichten und Listener starten... geloopt wird erst später

        this.canvas = document.createElement("canvas");
        this.canvas.id = "maincanvas";
        this.ctx = this.canvas.getContext("2d");
        this.ctx.translate(0.5, 0.5);
        $(this.canvas).appendTo("body");


        this.mapcanvas = document.createElement("canvas");
        this.mapctx = this.mapcanvas.getContext("2d");
        this.mapctx.translate(0.5, 0.5);
        $(this.mapcanvas).appendTo("body");
        $(this.mapcanvas).attr("id", "map");


        //inital einen resize triggern
        this._onResize();


        // ------------------------------------------------

        this.world = new WORLD("testarena");
        socket.emit("join", "testarena");

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

        });


        socket.on("worldupdate", function(data) {
            _this.world.updateFromServer(data.objects);
            _this.player = data.player;

            //clocksync
            _this._serverClockDiv = data.clock - Date.now();
        });



    },

    _serverClockDiv: 0,
    getServerTime: function() {
        return Date.now() + this._serverClockDiv;
    },

    start: function() {
        var _this = this;

        if (this.initiated && res.complete) {

            //Map zeichnen
            this._prepareMinimap();



            //Loop starten
            (function animloop(){
                requestAnimationFrame(animloop);
                _this._update();
            })();

            this.started = true;

            //Events binden
            // ------------------------------------------------
            window.onresize = function() { _this._onResize(); };
            window.onkeydown = function(e) { _this._onKeydown(e.keyCode); };
            window.onkeyup = function(e) { _this._onKeyup(e.keyCode); };
            window.onblur = function() { _this._onBlur(); };
            // ------------------------------------------------

        } else {
            //noch keine Antwort vom Server, oder nicht alle Grafiken geladen, warte nochmal
            window.setTimeout(function() { _this.start(); }, 500);
        }
    },


    _onResize: function() {

        var w = window.innerWidth;
        var h = window.innerHeight;

        this.canvas.width = w;
        this.canvas.height = h;

        this.mapcanvas.width = 0.2 * w;
        this.mapcanvas.height = 0.2 * h;

        this.cw = w;
        this.ch = h;

        this.mx = Math.floor(w / 2);
        this.my = Math.floor(h / 2);

        this._prepareStarLayers();

    },

    _onBlur: function() {
        this._flushKeys();
    },

    _keysdown: [],
    _onKeydown: function(code) {

        if (!this._keysdown[code]) {
            this._keysdown[code] = true;

            if(this.player && !this.player.exploding && !this.player.inactive) {
                if(code == 38) { socket.emit("thrust", "start"); }
                if(code == 40) { socket.emit("break", "start"); }
                if(code == 39) { socket.emit("tright", "start"); }
                if(code == 37) { socket.emit("tleft", "start"); }
                if(code == 78) { socket.emit("breaktostop", "start"); }
                if(code == 32) { socket.emit("shoot", "start"); }
                if(code == 225) { socket.emit("shoot2", "start"); }
                if(code == 84) { socket.emit("test", "start"); }
            }

        }

        if (code == 48) { window.debug = 0; console.log("debug set to "+window.debug);  }
        if (code == 49) { window.debug = 1; console.log("debug set to "+window.debug);  }
        if (code == 50) { window.debug = 2; console.log("debug set to "+window.debug);  }
        if (code == 51) { window.debug = 3; console.log("debug set to "+window.debug);  }
        if (code == 52) { window.debug = 4; console.log("debug set to "+window.debug);  }

    },

    _onKeyup: function(code) {
        this._keysdown[code] = false;

        if(this.player && !this.player.exploding && !this.player.inactive) {
            if(code == 38) { socket.emit("thrust", "stop"); }
            if(code == 40) { socket.emit("break", "stop"); }
            if(code == 39) { socket.emit("tright", "stop"); }
            if(code == 37) { socket.emit("tleft", "stop"); }
            if(code == 78) { socket.emit("breaktostop", "stop"); }
            if(code == 32) { socket.emit("shoot", "stop"); }
            if(code == 225) { socket.emit("shoot2", "stop"); }
            if(code == 84) { socket.emit("test", "stop"); }
        }
    },

    _flushKeys: function() {

        this._keysdown = [];

        socket.emit("allsystems", "stop");
    },

    _update: function() {
        var _this = this;

        if (this.player) { // Spiel läuft nur bei definiertem Spieler

            res.setViewport(this.ctx, this.player.x - this.mx, this.player.y - this.my, this.cw, this.ch)


            this._updateStars();
            this._updateStatics();
            this._updateObjects();


            // -----

            res.flush();


            this._updateMinimap();


            //todo: gescheiter Enegergy-HUD
            //Energielevel anzeigen
            this.ctx.fillStyle = "#ccf";
            this.ctx.fillText(Math.floor(this.player.e), 10, 15);


            //Position anzeigen
            this.ctx.fillStyle = "#fcf";
            this.ctx.fillText(Math.floor(this.player.x) + "," + Math.floor(this.player.y) , 10, 30);

        }

        //FPS
        _this._countFrames++;
        if (!this._fpsInterval) {
            this._fpsInterval = setInterval(function() {
                _this.fps = _this._countFrames * 2;
                _this._countFrames = 0;
            }, 500);
        }

        if (this.fps > 25) {
            this.ctx.fillStyle = "#0a0";
            this.ctx.fillText( this.fps, this.cw - 30, 15);
        } else {
            this.ctx.fillStyle = "#a00";
            this.ctx.fillText( this.fps, this.cw - 30, 15);
        }


    },


    _updateObjects: function() {
        var _this = this;

        ft.each(this.world.objects, function(obj) {

            if (!obj.inactive) {

                // Ebene wählen
                // 3 - Partikel / Effekte Hintergrund   - welt-translation
                // 4 - dynamische Objekte               - welt-translation
                // 5 - aktueller Spieler                - welt-translation
                // 7 - Partikel / Effekte Vordergrund   - welt-translation
                var layer = 4;
                if (obj.type != "player" || obj.name != _this.playername) { layer = 5; }

                var alpha = 1;


                if( obj.exploding ) {
                    alpha = 1 - obj.expp;
                }


                var cfg = {};

                if (alpha != 1) {
                    cfg.alpha = alpha;
                }
                if (obj.scale) {
                    cfg.scale = obj.scale;
                }
                if (typeof(obj.va) != "undefined") {
                    cfg.angle = obj.va;

                }
                if (obj.isanim)  {
                    cfg.anim = ((_this.getServerTime() - obj.t) / 1000) / obj.ad;

                }

                // Objekt zeichnen
                res.drawSprite(layer, obj.type, obj.x, obj.y, cfg);

            }

            // ---- Debug Vektoren
            if (window.debug >= 2) {
                //zeichne vektor
                var vx = Math.cos((obj.ma-90) * 0.0174532) * obj.s * 0.5;
                var vy = Math.sin((obj.ma-90) * 0.0174532) * obj.s * 0.5;

                res.drawPath(7,[
                    { x: 0 , y: 0  },
                    { x: vx, y: vy }
                ], obj.x, obj.y, "#f00", false);
            }
            // ----

        });

    },

    _updateStatics: function() {
        var _this = this;

        ft.each(this.world.statics, function(obj) {

            // 1 - Hintergrund Statics              - modifizierte welt-translation
            // 2 - Rückseiten Statics               - welt-translation
            // 6 - Vordergrund Statics              - welt-translation

            if(obj.type == "ni") {

                // Static ohne Bild mit Pfad
                ft.each(obj.ps, function(p) {
                    res.drawPath(6, p, obj.x, obj.y, obj.c, true);
                });

            } else {

                if (obj.bm) {

                    // Static im Hintergrund
                    res.drawSprite(1, obj.type, obj.x, obj.y);

                } else {

                    // Static mit Bild
                    res.drawSprite(2, obj.type, obj.x, obj.y, {back: true});
                    res.drawSprite(6, obj.type, obj.x, obj.y);


                    //Debug Collisionspfade
                    if (window.debug >= 2) {

                        ft.each(obj.ps, function(p) {
                            res.drawPath(7, p, obj.x, obj.y, "#f66", true);
                        });

                    }
                }
            }

        });

    },


    _updateStars: function() {
        var _this = this;



        if (this.starlayers) {

            var ls = this.starlayers[0].width;


            ft.each(this.starlayers, function(layer, i) {

                var x = (_this.player.x / (i+3)) % ls;
                var y = (_this.player.y / (i+3)) % ls;


                for (var k = 0 - x - ls; k < _this.cw; k += ls) {
                    for (var l = 0 - y - ls; l < _this.ch; l += ls) {

                        res.drawImage(0, layer, k, l);

                    }

                }

            });



        }

    },

    _updateMinimap: function() {

        // Minimap updaten
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

        var _this = this;
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

                // Static mit Bild, nicht im Hintergrund (bm)
                if (!obj.bm) {

                    //mctx.drawImage(sprite.img)

                    //res.drawSprite(mctx,  obj.type, (obj.x - mx), (obj.y - my), { zoom:zoom });
                }
            }

        });

    },


    starlayers: null,
    _prepareStarLayers: function() {
        var _this = this;

        this.starlayers = [];

        var getRandom = function(max) {
            return parseInt(Math.random() * (max+1));
        };

        var layercolors = [ 180, 100, 50 ];
        var starsperlayer = 30;
        var layersize = 1000;

        _.each(layercolors, function(color) {

            var layer = document.createElement("canvas");
            var lctx = layer.getContext("2d");
            layer.width = layersize;
            layer.height = layersize;00

            var r = 2;

            var star = document.createElement("canvas");
            star.width = r*2;
            star.height = r*2;
            var sctx = star.getContext("2d");


            // point
            sctx.fillStyle = 'rgba('+color+','+color+','+color+',1)';
            sctx.fillRect(r, r, 1, 1);




            for(var i = 0; i < starsperlayer; i++) {
                var x = getRandom(layersize-(2*r));
                var y = getRandom(layersize-(2*r));

                lctx.drawImage(star,x,y);
            }

            _this.starlayers.push(layer);
        });



    }



};
//mach den _init und gib das objekt aus
obj._init();
return obj;
};});