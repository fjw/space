define(["lodash", "jquery", "rafpolyfill", "world", "res", "ftools"], function(_, $, rafpolyfill, WORLD, RES, ft) { return function() {
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
    res: null,

    playername: null,
    player: null,

    started: false,
    initiated: false,
    resloaded: false,

    //---------------------------
    _fpsInterval: null,
    _countFrames: 0,
    fps: 0,
    //---------------------------

    _init: function() {
        //einrichten und Listener starten... geloopt wird erst später

        var _this = this;

        this.canvas = document.createElement("canvas");
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

        this.world = new WORLD("myworld");
        this.res = new RES(
            function(per) {
                //console.log(per);
            },
            function() {
                _this.resloaded = true;
            }
        );

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


            //register worldfunctions
            var wf = function() {
                eval(data.worldfunctions);
                return { updateObj: updateObj };
            };

            _this.world.worldfunctions = wf();

        });


        socket.on("worldupdate", function(data) {
            _this.world.updateFromServer(data.objects);
            _this.player = data.player;

            //clocksync
            _this._serverClockDiv = data.clock - Date.now();
        });


        // ------------------------------------------------
        window.onresize = function() { _this._onResize(); };
        window.onkeydown = function(e) { _this._onKeydown(e.keyCode); };
        window.onkeyup = function(e) { _this._onKeyup(e.keyCode); };
        window.onblur = function() { _this._onBlur(); };
        // ------------------------------------------------
    },

    _serverClockDiv: 0,
    getServerTime: function() {
        return Date.now() + this._serverClockDiv;
    },

    start: function() {
        var _this = this;

        if (this.initiated && this.resloaded) {

            //Map zeichnen
            this._prepareMinimap();



            //Loop starten
            (function animloop(){
                requestAnimationFrame(animloop);
                _this._update();
            })();

            this.started = true;
        } else {
            //noch keine Antwort vom Server, oder nicht alle Grafiken geladen, warte nochmal
            setTimeout(function() { _this.start(); }, 500);
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

            if(!this.player.exploding && !this.player.inactive) {
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

        if (code == 48) { window.debug = 0; }
        if (code == 49) { window.debug = 1; }
        if (code == 50) { window.debug = 2; }
        if (code == 51) { window.debug = 3; }
        if (code == 52) { window.debug = 4; }

    },

    _onKeyup: function(code) {
        this._keysdown[code] = false;

        if(!this.player.exploding && !this.player.inactive) {
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


        this.res.setViewport(this.ctx, this.player.x - this.mx, this.player.y - this.my, this.cw, this.ch)


        // alle Layer clearen
        //this.ctx.clearRect(0, 0, _this.cw, _this.ch);

        var x1 = Math.round(this.mx - this.player.x);
        var y1 = Math.round(this.my - this.player.y);


        // ----- Operationen mit Welt-Koordinaten ----- Layer 2-7
        /*
        var transX = Math.round(this.mx - this.player.x);
        var transY = Math.round(this.my - this.player.y);

        for (var i = 2; i <= 7; i++ ) {
            this.ctxs[i].save();
            this.ctxs[i].translate( transX , transY );
        }
        //modifizierter Trans für Layer 1
        this.ctxs[1].save();
        this.ctxs[1].translate( Math.round(this.mx - (this.player.x * 0.5)) , (this.my - (this.player.y * 0.5)) );
*/


        this._updateStars();
        this._updateStatics();
        this._updateObjects();

        // ----- Welt-Koordinaten wiederherstellen----- Layer 1-7
        /*
        for (i = 1; i <= 7; i++ ) {
            this.ctxs[i].restore();
        }
        */


        //todo: gescheiter Enegergy-HUD
        //Energielevel anzeigen
        //this.ctxs[8].fillStyle = "#ccf";
        //this.ctxs[8].fillText(Math.floor(this.player.e), 10, 15);


        //Position anzeigen
        //this.ctxs[8].fillStyle = "#fcf";
        //this.ctxs[8].fillText(Math.floor(this.player.x) + "," + Math.floor(this.player.y) , 10, 30);





        // -----





        // -----

        this.res.flush();


        this._updateMinimap();

        //FPS
        _this._countFrames++;
        if (!this._fpsInterval) {
            this._fpsInterval = setInterval(function() {
                _this.fps = _this._countFrames;
                _this._countFrames = 0;
            }, 1000);
        }

        if (this.fps > 40) {
            this.ctx.fillStyle = "#0a0";
            this.ctx.fillText( this.fps, this.cw - 30, 15);
        } else {
            this.ctx.fillStyle = "#a00";
            this.ctx.fillText( this.fps, this.cw - 30, 15);
        }


        //clientside-World-Berechnung
        this.world.update();
    },


    _updateObjects: function() {
        var _this = this;

        _.each(this.world.objects, function(obj) {

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


                if (alpha != 1) {
                    //ctx.globalAlpha = alpha; //todo: alpha!
                }

                // Zeichnen je nach Typ
                if (typeof(obj.va) != "undefined") {

                    // gewinkeltes Objekt
                    _this.res.drawSprite(layer, obj.type, obj.x, obj.y, {angle: obj.va});

                } else if (obj.isanim)  {

                    // animiertes Objekt
                    var cfg = {
                        anim: ((_this.getServerTime() - obj.t) / 1000) / obj.ad
                    };

                    if (obj.scale) {
                        cfg.scale = obj.scale;
                    }

                    _this.res.drawSprite(layer, obj.type, obj.x, obj.y, cfg );

                } else {

                    // sonstiges Objekt zeichnen
                    _this.res.drawSprite(layer, obj.type, obj.x, obj.y);

                }

                if (alpha != 1) {
                    //ctx.globalAlpha = 1; //todo: alpha!
                }

            }

            // ---- Debug Vektoren
            /* //todo:!!
            if (window.debug >= 2) {
                //zeichne vektor
                var vx = Math.cos((obj.ma-90) * 0.0174532) * obj.s * 0.5;
                var vy = Math.sin((obj.ma-90) * 0.0174532) * obj.s * 0.5;
                _this.ctxs[7].beginPath();
                _this.ctxs[7].moveTo(obj.x, obj.y);
                _this.ctxs[7].lineTo(obj.x + vx, obj.y + vy);
                _this.ctxs[7].strokeStyle = "#f00";
                _this.ctxs[7].stroke();
            }
            */
            // ----

        });

    },

    _updateStatics: function() {
        var _this = this;

        _.each(this.world.statics, function(obj) {

            // 1 - Hintergrund Statics              - modifizierte welt-translation
            // 2 - Rückseiten Statics               - welt-translation
            // 6 - Vordergrund Statics              - welt-translation

            if(obj.type == "ni") {



                // Static ohne Bild mit Pfad
                /* //todo !!

                 var layer = 6;
                ctx.beginPath();

                _.each(obj.p, function(p, i) {
                    if( i == 0 ) {
                        ctx.moveTo(p.x + obj.x, p.y + obj.y);
                    } else {
                        ctx.lineTo(p.x + obj.x, p.y + obj.y);
                    }
                });
                ctx.closePath();
                ctx.fillStyle = obj.c;
                ctx.fill();
                */

            } else {

                if (obj.bm) {

                    // Static im Hintergrund
                    _this.res.drawSprite(1, obj.type, obj.x, obj.y);

                } else {

                    // Static mit Bild
                    _this.res.drawSprite(2, obj.type, obj.x, obj.y, {back: true});
                    _this.res.drawSprite(6, obj.type, obj.x, obj.y);


                    //Debug Collisionspfade
                    if (window.debug >= 2) {
                        /* //todo!!
                        var ctx = _this.ctxs[6];
                        ctx.beginPath();
                        _.each(obj.p, function(p, i) {
                            if( i == 0 ) {
                                ctx.moveTo(p.x + obj.x, p.y + obj.y);
                            } else {
                                ctx.lineTo(p.x + obj.x, p.y + obj.y);
                            }
                        });
                        ctx.closePath();
                        ctx.fillStyle = "#f00";
                        ctx.fill();
                        */
                    }
                }
            }

        });

    },


    _updateStars: function() {
        var _this = this;

        if (this.starlayers) {

            var ls = this.starlayers[0].width;

            //todo!!
            //this.ctxs[0].clearRect(0, 0, this.cw, this.ch);

            _.each(this.starlayers, function(layer, i) {

                var x = (_this.player.x / (i+3)) % ls;
                var y = (_this.player.y / (i+3)) % ls;


                for (var k = 0 - x - ls; k < _this.cw; k += ls) {
                    for (var l = 0 - y - ls; l < _this.ch; l += ls) {

                        _this.res.drawImage(0, layer, Math.round(k), Math.round(l));

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

                    //todo: neues System für Minimap
                    //_this.res.drawSprite(mctx,  obj.type, (obj.x - mx), (obj.y - my), { zoom:zoom });
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