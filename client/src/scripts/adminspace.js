define(["underscore", "jquery", "rafpolyfill", "world", "res"], function(_, $, rafpolyfill, WORLD, RES) { return function() {
    var obj = {

        //--------------------

        world: null,
        res: null,


        started: false,
        initiated: false,

        _init: function() {
            //einrichten und Listener starten... geloopt wird erst später

            var _this = this;



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


        },


        start: function() {
            var _this = this;


            this.started = true;
        },

        zoom: 0.2,
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

            // raster zeichnen
            var drawLine = function(x1, y1, x2, y2, col) {
                mctx.strokeStyle = col;
                mctx.beginPath();
                mctx.moveTo(x1,y1);
                mctx.lineTo(x2,y2);
                mctx.stroke();
            };

            for(var x = -100; x >= min_x.x; x -= 100) {
                drawLine( (x - mx) * zoom , 0, (x - mx) * zoom, h, "#eee" );
            }
            for(var x = 100; x <= max_x.x + max_x.w; x += 100) {
                drawLine( (x - mx) * zoom , 0, (x - mx) * zoom, h, "#eee" );
            }
            for(var y = -100; y >= min_y.y; y -= 100) {
                drawLine( 0, (y - my) * zoom, w, (y - my) * zoom, "#eee" );
            }
            for(var y = 100; y <= max_y.y + max_y.h ; y += 100) {
                drawLine( 0, (y - my) * zoom, w, (y - my) * zoom, "#eee");
            }

            drawLine( (0 - mx) * zoom , 0, (0 - mx) * zoom, h, "#ddd" );
            drawLine( 0, (0 - my) * zoom, w, (0 - my) * zoom, "#ddd" );

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
                    //todo: collisionspfade zeichnen
                }

            });

            $("body").append(this._mapbuffer);

        }



    };
//mach den _init und gib das objekt aus
    obj._init();
    return obj;
};});