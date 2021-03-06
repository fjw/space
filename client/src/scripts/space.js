define(["lodash", "jquery", "rafpolyfill", "world", "ftools"], function(_, $, rafpolyfill, WORLD, ft) { return function(options) {

// Zeitfunktion
var supportsPerformanceNow = false;
if(performance && performance.now && typeof(performance.now) == "function") {
    supportsPerformanceNow = true;
}
var getTime = function() {
    if(supportsPerformanceNow) {
        return performance.now();
    } else {
        return Date.now();
    }
};


var obj = {

    options: {},

    //--------------------
    layers: [],
    ctxs: [],

    //todo: obsolet?
    mapcanvas: null,
    mapctx: null,


    canvas: null,
    ctx: null,

    cw: 0, // Canvas-Breite
    ch: 0, // Canvas-Höhe

    mx: 0, // Canvas-Mitte-X
    my: 0, // Canvas-Mitte-Y
    //--------------------

    world: null,

    playername: null,
    player: null,

    started: false,
    initiated: false,

    //---------------------------
    _fpsInterval: null,
    _countFrames: 0,
    fps: 0,             // FPS
    //---------------------------

    latency: 0,         // aktuelle Ping-Zeit
    _lastping: 0,

    //---------------------------

    _init: function() {
        var _this = this;

        if(options) { this.options = options; }

        //einrichten und Listener starten... geloopt wird erst später

        this.canvas = document.createElement("canvas");
        this.canvas.id = "maincanvas";
        this.ctx = this.canvas.getContext("2d");
        this.ctx.translate(0.5, 0.5);

        $(this.canvas).appendTo("body");

/* todo: obsolet?? oder doch die bessere lösung?
        this.mapcanvas = document.createElement("canvas");
        this.mapctx = this.mapcanvas.getContext("2d");
        this.mapctx.translate(0.5, 0.5);
        $(this.mapcanvas).appendTo("body");
        $(this.mapcanvas).attr("id", "map");
        */


        //inital einen resize triggern
        this._onResize();


        // ------------------------------------------------

        this.world = new WORLD("testarena");
        socket.emit("join", "testarena");

        // ------------------------------------------------

        socket.on("ini", function(data) {

            if (_this.initiated) {
                //wurde schonmal gestartet, Server restart? => Reload Page
                document.location.reload(true);
            }
            _this.initiated = true;


            //register playername
            _this.playername = data.playername;

            //register statics
            _this.world.statics = data.statics;

            //register worldconfig
            _this.world.cfg = data.cfg;

            //initialisiere die Minimap
            _this._prepareMinimap();
            //todo: das sollte vor dem spawn, am besten vor launchbutton schon passieren

        });

        socket.on("newcfg", function(data) {
            _this.world.cfg = data.cfg;
        });

        socket.on("wu", function(data) {
            _this.world.updateFromServer(data.objects);
            _this.player = data.player;
        });

        socket.on("wpu", function(data) {
            _this.world.updatePlayerFromServer(data.player);
            _this.player = data.player;
        });


        socket.on("po", function(datenow) {
            var thistime = _this.world.getLocalTime();

            //momentaner Lag
            _this.latency = ft.round(thistime - _this._lastping);

            //clocksync
            _this.world.clockDiff = datenow - thistime;
        });

        var ping = function() {
            var thistime = _this.world.getLocalTime();
            _this._lastping = thistime;
            socket.emit("pi", thistime);
        };

        //regelmässig Pingen
        window.setInterval(function() {
           ping();
        }, 10000);
        ping();

    },



    start: function() {
        var _this = this;

        if (this.initiated && res.complete) {



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

        var $cnv = $(this.canvas);
        if(options && options.screensize) {
            var oss = options.screensize;

            if (w > oss) { w = oss; }
            if (h > oss) { h = oss; }

            var top = (window.innerHeight - oss) / 2;
            var left = (window.innerWidth - oss) / 2;

            if (top < 0) { top = 0; }
            if (left < 0) { left = 0; }

            $cnv.css({ top: top + "px", left: left + "px" });
        } else {
            $cnv.css({ top: 0, left: 0 });
        }

        this.canvas.width = w;
        this.canvas.height = h;

        /* //todo: obsolet?
        this.mapcanvas.width = 0.2 * w;
        this.mapcanvas.height = 0.2 * h;
        */

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

                var pa = null;

                if(code == 38) { pa = "t"; }    // up
                if(code == 40) { pa = "b"; }    // down
                if(code == 39) { pa = "r"; }    // right
                if(code == 37) { pa = "l"; }    // left
                if(code == 78) { pa = "s"; }    // n
                if(code == 32) { pa = "sa"; }   // space
                if(code == 66)  { pa = "sb"; }  // b
                //if(code == 84) { socket.emit("test", "start"); }

                if (pa) {
                    socket.emit("pa", {a: pa + "1"});
                }
            }

        }

        if (code == 48) { window.debug = 0; console.log("debug set to "+window.debug);  } // 0
        if (code == 49) { window.debug = 1; console.log("debug set to "+window.debug);  } // 1
        if (code == 50) { window.debug = 2; console.log("debug set to "+window.debug);  } // 2
        if (code == 51) { window.debug = 3; console.log("debug set to "+window.debug);  } // 3
        if (code == 52) { window.debug = 4; console.log("debug set to "+window.debug);  } // 4

    },

    _onKeyup: function(code) {
        this._keysdown[code] = false;

        if(this.player && !this.player.exploding && !this.player.inactive) {

            var pa = null;

            if(code == 38) { pa = "t"; }
            if(code == 40) { pa = "b"; }
            if(code == 39) { pa = "r"; }
            if(code == 37) { pa = "l"; }
            if(code == 78) { pa = "s"; }
            if(code == 32) { pa = "sa"; }
            if(code == 66)  { pa = "sb"; }
            //if(code == 84) { socket.emit("test", "stop"); }

            if (pa) {
                socket.emit("pa", {a: pa + "0"});
            }

        }
    },

    _flushKeys: function() {

        this._keysdown = [];

        socket.emit("pa", {a:"as"}); //allstop!!
    },

    _update: function() {

        if (this.player) { // Spiel läuft nur bei definiertem Spieler

            //Welt updaten!
            this.player = this.world.update(this.playername, this.latency);


            res.setViewport(this.ctx, this.player.x - this.mx, this.player.y - this.my, this.cw, this.ch);


            this._updateStars();
            this._updateStatics();
            this._updateObjects();


            this._updateHud();

            // -----

            res.flush();

        }

    },

    _lastMapUpdate: 0,
    _updateHud: function() {
        // HUD zeichnen
        // 8 - HUD                              - keine translation
        var _this = this;

        if(!this.player.exploding && !this.player.inactive) {

            // Energieanzeige
            var pe = this.player.e / 100;
            var eb = Math.floor((this.cw * pe)/2);

            var r = Math.floor(255 - 255 * pe);
            var g = Math.floor(100 * pe);
            var b = Math.floor(255 * pe);

            var ecol = "rgb("+r+","+g+","+b+")";
            res.drawRect(8, this.mx - eb, this.ch - 6, 2 * eb, 6, ecol, true);

            // Map-Name
            res.drawText(8, 15, this.ch - this.minimap_h - 20, "#888", this.world.name, "12px Play");

            // Player-Name
            res.drawText(8, 15, this.ch - this.minimap_h - 40, "#d00", this.player.name, "12px Play");

            // Minimap
            if(this.minimapimg) {

                var thistime = getTime();

                if (this._lastMapUpdate + 100 < thistime) {
                    this._lastMapUpdate = thistime;
                    this._updateMinimap();
                }

                res.drawImage(8, this.minimap, 10, this.ch - this.minimap_h - 16);
            }

        }

        //Debug-Infos
        if(window.debug >= 1) {

            //Position anzeigen
            res.drawText(8, 10, 15, "#fcf", "pos: " + Math.floor(this.player.x) + "," + Math.floor(this.player.y), "12px Play");

            //FPS anzeigen
            this._countFrames++;
            if (!this._fpsInterval) {
                this._fpsInterval = setInterval(function() {
                    _this.fps = _this._countFrames * 2;
                    _this._countFrames = 0;
                }, 500);
            }

            if (this.fps > 25) {
                res.drawText(8, this.cw - 60, 15, "#0a0", "fps: " + this.fps.toString(), "12px Play");
            } else {
                res.drawText(8, this.cw - 60, 15, "#a00", "fps: " + this.fps.toString(), "12px Play");
            }

            //Latency anzeigen
            res.drawText(8, this.cw - 60, 30, "#ccc", "ping: " + this.latency.toString(), "12px Play");

        }

    },

    _updateObjects: function() {
        var _this = this;

        ft.each(this.world.objects.concat(this.world.localobjects), function(obj) {

            if (!obj.inactive) {

                // Ebene wählen
                // 3 - Partikel / Effekte Hintergrund   - welt-translation
                // 4 - dynamische Objekte               - welt-translation
                // 5 - aktueller Spieler                - welt-translation
                // 7 - Partikel / Effekte Vordergrund   - welt-translation
                var layer = 4;
                if (obj.type == "player" && obj.name == _this.playername) { layer = 5; }

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

                    if(obj.cyclicanim) {
                        cfg.anim = ((_this.world.getServerTime() - obj.t) / 1000) / obj.cyclicanim;
                        cfg.cyclicanim = true;
                    } else {
                        cfg.anim = ((_this.world.getServerTime() - obj.t) / 1000) / obj.ad;
                    }

                }

                // Objekt zeichnen
                res.drawSprite(layer, obj.type, obj.x, obj.y, cfg);

                if (obj.type == "player" && obj.name != _this.playername) {
                    // feindlicher Spieler

                    // Name
                    res.drawText(layer, obj.x - 10, obj.y + 26, "#888", obj.name, "12px Play");
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

            }

        });

    },

    _updateStatics: function() {

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

                if (obj.bg) {

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

    minimap: null,
    minimap_ctx: null,
    minimap_w: 200,
    minimap_h: 200,


    _updateMinimap: function() {
        var _this = this;

        var mapctx = this.minimap_ctx;
        var zoom = this.minimapzoom;

        // Minimap leeren
        mapctx.clearRect(0, 0, this.minimap_w, this.minimap_h);

        // Background
        mapctx.fillStyle = "#111";
        mapctx.fillRect(0, 0, this.minimap_w, this.minimap_h);

        var mx = ft.round((this.player.x - this.minimapimg_minx) * zoom);
        var my = ft.round((this.player.y - this.minimapimg_miny) * zoom);

        var kx = ft.round(this.minimap_w / 2); // Mittelpunkt des Kartenviewports
        var ky = ft.round(this.minimap_h / 2);

        var mapx = kx - mx;
        var mapy = ky - my;

        mapctx.drawImage(this.minimapimg, mapx, mapy);

        // Mittelpunkt
        mapctx.fillStyle = "#d00";
        mapctx.fillRect(kx, ky, 1, 1);

        // Explosionsblipps
        var explodingobjects = _.filter(this.world.objects, function(obj) { return obj.exploding; });
        _.each(explodingobjects, function(obj) {

            var ox = ft.round((obj.x - _this.minimapimg_minx) * zoom);
            var oy = ft.round((obj.y - _this.minimapimg_miny) * zoom);

            mapctx.fillStyle = "#d00";
            mapctx.beginPath();
            mapctx.arc( mapx + ox, mapy + oy, 2, 0, 6.283185307179586, false);
            mapctx.fill();

        });

        // Rahmen
        var cw = ft.round(this.cw * zoom);
        var ch = ft.round(this.ch * zoom);
        mapctx.strokeStyle = "#888";
        mapctx.lineWidth = 1;
        mapctx.strokeRect(ft.round(kx - (cw / 2))+0.5, ft.round(ky - (ch / 2))+0.5, cw, ch );

        mapctx.strokeRect(0,0, this.minimap_w, this.minimap_h);
    },

    minimapimg: null,
    minimapzoom: 0.06,
    minimapimg_minx:0,
    minimapimg_miny:0,
    _prepareMinimap: function() {

        // Minimap-Canvas einrichten
        this.minimap = document.createElement("canvas");
        this.minimap_ctx = this.minimap.getContext("2d");
        this.minimap.width = this.minimap_w;
        this.minimap.height = this.minimap_h;

        // Grenzen finden
        var max_x = _.max(this.world.statics, function(item) { return item.x + item.w; });
        var max_y = _.max(this.world.statics, function(item) { return item.y + item.h; });
        var min_x = _.min(this.world.statics, function(item) { return item.x; });
        var min_y = _.min(this.world.statics, function(item) { return item.y; });

        var w = max_x.x + max_x.w - min_x.x;
        var h = max_y.y + max_y.h - min_y.y;

        var mx = min_x.x;
        var my = min_y.y;

        this.minimapimg_minx = mx;
        this.minimapimg_miny = my;

        // Img  Canvas einrichten
        this.minimapimg = document.createElement("canvas");
        var mctx = this.minimapimg.getContext("2d");

        var zoom = this.minimapzoom;

        this.minimapimg.width = w * zoom;
        this.minimapimg.height = h * zoom;

        // Statics durchgehen
        _.each(this.world.statics, function(obj) {

            if(obj.type == "ni") {

                // Static Pfad ohne Bild
                _.each(obj.ps, function(poli) {

                    mctx.beginPath();

                    _.each(poli, function(p, i) {
                        if( i == 0 ) {
                            mctx.moveTo( (p.x + obj.x - mx)*zoom, (p.y + obj.y - my)*zoom);
                        } else {
                            mctx.lineTo( (p.x + obj.x - mx)*zoom, (p.y + obj.y - my)*zoom);
                        }
                    });

                    mctx.closePath();
                    mctx.fillStyle = obj.c;
                    mctx.fill();
                });


            } else {

                // Static mit Bild, nicht im Hintergrund (bg)
                if (!obj.bg) {

                    var sprite = res.resitems[obj.type];
                    if(sprite) {
                        var img = sprite.img;

                        if(img) {

                            mctx.drawImage(img, (obj.x - mx)*zoom, (obj.y - my)*zoom, img.width * zoom, img.height * zoom );

                        }
                    }

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
            layer.height = layersize;

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