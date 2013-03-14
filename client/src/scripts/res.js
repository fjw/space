define(["underscore"], function(_) { return function(updateCallback, allLoadedCallback) {
var obj = {

    updateCallback: updateCallback,
    allLoadedCallback: allLoadedCallback,

    resitems: {
        player: {
            uri: "/res/fighter1.png",
            center: {x:25, y:25},
            //rotations: true,
            spriterotframes: 1, // Zeile in der die Frames sind
            w: 50,
            h: 50
        },

        station: {
            uri: "/res/stationt.png",
            buri: "/res/stationb.png"
        },

        gasplanet1: {
            uri: "/res/gasplanet1.png"
        },

        asteroid1: {
            uri: "/res/asteroid1.png"
        },
        asteroid2: {
            uri: "/res/asteroid2.png"
        },
        asteroid3: {
            uri: "/res/asteroid3.png"
        },
        asteroid4: {
            uri: "/res/asteroid4.png"
        },
        asteroid5: {
            uri: "/res/asteroid5.png"
        },
        asteroid6: {
            uri: "/res/asteroid6.png"
        },
        asteroid7: {
            uri: "/res/asteroid7.png"
        },
        asteroid8: {
            uri: "/res/asteroid8.png"
        },
        asteroid9: {
            uri: "/res/asteroid9.png"
        },
        asteroid10: {
            uri: "/res/asteroid10.png"
        },
        asteroid11: {
            uri: "/res/asteroid11.png"
        },
        asteroid12: {
            uri: "/res/asteroid12.png"
        },
        asteroid13: {
            uri: "/res/asteroid13.png"
        },


        explosion: {
            create: "createParticle_Explosion",
            center: {x:15, y:15}
        }
    },

    percentLoaded: 0,
    _init: function() {
        var _this = this;

        _.each(this.resitems, function(item) {

            if(item.uri || item.buri){

                item.img = new Image();
                item.img.src = item.uri;

                if (item.buri) {
                    item.bimg = new Image();
                    item.bimg.src = item.buri;
                }

                item.img.onload = function() {
                    if(item.rotations) {
                        // Rotationen werden erzeugt
                        _this._preloadRotations(item);
                    }

                    if(item.spriterotframes) {
                        // Image ist ein waagrechtes Sprite, lade Rotationframes aus Zeile
                        _this._loadRotationSprite(item);
                    }

                    _this._ressourceLoaded(item);
                };

            } else if(item.create) {
                //Partikel erzeugen
                _this[item.create](item);

                _this._ressourceLoaded(item);
            }

        });
    },

    _ressourceLoaded: function(item) {

        //bounding-boxes laden
        if(!item.w) {
            if (item.img) {
                item.w = item.img.width;
                item.h = item.img.height;
            } else if (item.bimg) {
                item.w = item.bimg.width;
                item.h = item.bimg.height;
            } else if (item.animimgs && item.animimgs[0]) {
                item.w = item.animimgs[0].width;
                item.h = item.animimgs[0].height;
            } else if (item.angleimgs && item.angleimgs[0]) {
                item.w = item.angleimgs[0].width;
                item.h = item.angleimgs[0].height;
            }
        }


        item.complete = true;

        var completeItems = _.filter(this.resitems, function(resitem) { return resitem.complete; });

        this.percentLoaded = completeItems.length / _.size(this.resitems);

        if (typeof(this.updateCallback) == "function") {
            this.updateCallback(this.percentLoaded);
        }

        if (typeof(this.allLoadedCallback) == "function" && this.percentLoaded >= 1) {
            this.allLoadedCallback();
        }
    },

    _loadRotationSprite: function(resitem) {

        var rotationSteps = 35;

        var qy = (resitem.spriterotframes - 1) * resitem.h;

        var imgs = [];
        var i = 0;
        for(var d = 0; d < 360; d += 360 / rotationSteps) {

            d = Math.round(d);

            var cc = document.createElement("canvas");
            var ctx = cc.getContext("2d");
            cc.width = resitem.w;
            cc.height = resitem.h;

            var qx = i * 50;
            i++;

            ctx.drawImage(resitem.img, qx, qy, resitem.w, resitem.h, 0, 0, resitem.w, resitem.h);

            imgs.push({d:d, img:cc});

        }

        //altes SpriteSliceBild löschen, Speicher! und Komplikationen
        resitem.img = null;

        resitem.angleimgs = imgs;
    },

    _preloadRotations: function(resitem) {

        var rotationSteps = 35;

        var mcc = document.createElement("canvas");
        mcc.width = resitem.img.width;
        mcc.height = resitem.img.height;
        var mctx = mcc.getContext("2d");
        mctx.drawImage(resitem.img, 0, 0);
        mctx.save();

        var imgs = [];
        for(var d = 0; d < 360; d += 360 / rotationSteps) {

            d = Math.round(d);

            var cc = document.createElement("canvas");
            var ctx = cc.getContext("2d");
            cc.width = resitem.img.width;
            cc.height = resitem.img.height;

            ctx.save();
            ctx.translate(resitem.center.x, resitem.center.y);
            ctx.rotate(d * Math.PI / 180);
            ctx.drawImage(mcc, -resitem.center.x, -resitem.center.y);
            ctx.restore();

            imgs.push({d:d, img:cc});
        }

        resitem.angleimgs = imgs;
    },

    drawParticle: function(ctx) {

        ctx.beginPath();
        ctx.arc(100,100,50,Math.PI*2, false);
        ctx.fill();


    },

    drawErrorPlaceholder: function(ctx, x, y) {
        //kein Bild vorhanden, Platzhalter zeichnen
        ctx.fillStyle = "#f00";
        ctx.fillRect(Math.round(x - 2), Math.round(y - 2), 5, 5);
    },

    _drawOperations:[],
    drawSprite: function(layer, spritename, x, y, cfg) {

        this._drawOperations.push({
            layer: layer,
            spritename: spritename,
            x: x,
            y: y,
            cfg: cfg
        });

    },

    drawImage: function(layer, image, x, y) {

        this._drawOperations.push({
            layer: layer,
            image: image,
            x: x,
            y: y
        });

    },

    flush: function(ctx, w, h) {

        //var ops = _.sortBy(this._drawOperations, function(item) { return item.layer; });
/*
        _.filter(this._drawOperations, function(item) { return item.layer == 0; });
        _.filter(this._drawOperations, function(item) { return item.layer == 1; });
        _.filter(this._drawOperations, function(item) { return item.layer == 2; });
        _.filter(this._drawOperations, function(item) { return item.layer == 3; });
        _.filter(this._drawOperations, function(item) { return item.layer == 4; });
        _.filter(this._drawOperations, function(item) { return item.layer == 5; });
        _.filter(this._drawOperations, function(item) { return item.layer == 6; });
        _.filter(this._drawOperations, function(item) { return item.layer == 7; });
        _.filter(this._drawOperations, function(item) { return item.layer == 8; });
*/

//        ctx.clearRect(0, 0, _this.cw, _this.ch);

    },

    flushSprite: function(ctx, spritename, x, y, cfg) {

        var sprite = this.resitems[spritename];

        if(!sprite) {
            this.drawErrorPlaceholder(ctx,x,y);
        } else {
            // Sprite vorhanden

            // Bildquelle wählen
            var img;
            if (cfg && cfg.back && sprite.bimg) {

                // Backimage
                img = sprite.bimg;

            } else if ( cfg && typeof(cfg.angle) != "undefined") {

                // Winkelbild
                img = _.min(sprite.angleimgs, function(item) { return Math.abs(cfg.angle - item.d); }).img;
                //todo: performance

            } else if ( cfg && typeof(cfg.anim) != "undefined") {

                // Animationframe
                img = sprite.animimgs[Math.floor(cfg.anim * (sprite.frames-1))];

            } else {

                // normales Bild
                img = sprite.img;

            }

            if(!img) {
                if (!cfg || !cfg.onlyifavailable) {
                    this.drawErrorPlaceholder(ctx,x,y);
                }
            } else {

                //alles klar, zeichne Bild
                var cx = 0;
                var cy = 0;
                if (sprite.center) {
                    cx = sprite.center.x;
                    cy = sprite.center.y;
                }

                if(cfg && cfg.zoom) {

                    ctx.drawImage( img,
                        Math.round((x - cx)*cfg.zoom),
                        Math.round((y - cy)*cfg.zoom),
                        Math.round(img.width*cfg.zoom),
                        Math.round(img.height*cfg.zoom)
                    );

                } else if(cfg && cfg.scale) {

                    ctx.drawImage( img,
                        Math.round(x - cx*cfg.scale),
                        Math.round(y - cy*cfg.scale),
                        Math.round(img.width*cfg.scale),
                        Math.round(img.height*cfg.scale)
                    );

                } else {
                    ctx.drawImage( img,
                        Math.round(x - cx),
                        Math.round(y - cy)
                    );
                }

            }

        }



    },

    flushImage: function(ctx, image, x, y) {
        ctx.drawImage(image, x, y);
    },



    //Canvase einrichten
    // 0 - Sterne                           - ultradyn
    // 1 - Hintergrund Statics              - modifizierte welt-translation
    // 2 - Rückseiten Statics               - welt-translation
    // 3 - Partikel / Effekte Hintergrund   - welt-translation
    // 4 - dynamische Objekte               - welt-translation
    // 5 - aktueller Spieler                - welt-translation
    // 6 - Vordergrund Statics              - welt-translation
    // 7 - Partikel / Effekte Vordergrund   - welt-translation
    // 8 - HUD                              - keine translation


    createParticle_Explosion: function(resitem) {

        var size = 30;
        var frames = 30;

        //speichern für die anim
        resitem.frames = frames;

        var r = Math.floor(size/2);

        var imgs = [];
        for(var t = 0; t < frames; t++) {
            var f = t/frames;

            var cnv = document.createElement("canvas");
            cnv.width = size;
            cnv.height = size;

            var ctx = cnv.getContext("2d");

            var blackalpha = 'rgba(0,0,0,0)';
            var innercolor = 'yellow';
            var outercolor = 'orange';
            var smoke = 'grey';

            var gr = ctx.createRadialGradient(r, r ,0, r, r, r);

            gr.addColorStop(0, blackalpha);

            var p1 = 0.3;
            var p2 = 0.7;


            var a, b, c, d, m;

            if (f < p1) {

                m = f / p1;

                a = 0;
                b = 0.6 * m;
                c = m;

                if (a < 0) { a = 0; } if (b < 0) { b = 0; } if (c < 0) { c = 0; }
                if (a > 1) { a = 1; } if (b > 1) { b = 1; } if (c > 1) { c = 1; }

                gr.addColorStop(a, innercolor);
                gr.addColorStop(b, outercolor);
                gr.addColorStop(c, blackalpha);

            } else if ( f < p2 ) {

                m = (f - p1) / (p2 - p1);

                a = 0;
                b = 0.6 - 0.6 * m;
                c = 0.8 - 0.2 * m;
                d = 1;

                if (a < 0) { a = 0; } if (b < 0) { b = 0; } if (c < 0) { c = 0; } if (d < 0) { d = 0; }
                if (a > 1) { a = 1; } if (b > 1) { b = 1; } if (c > 1) { c = 1; } if (d > 1) { d = 1; }

                gr.addColorStop(a, innercolor);
                gr.addColorStop(b, outercolor);
                gr.addColorStop(c, smoke);
                gr.addColorStop(d, blackalpha);
            } else {

                m = (f - p2) / (1 - p2);

                a = m;
                b = m + 0.2;
                c = 0.6 + 0.4 * m;
                d = 1;

                if (a < 0) { a = 0; } if (b < 0) { b = 0; } if (c < 0) { c = 0; } if (d < 0) { d = 0; }
                if (a > 1) { a = 1; } if (b > 1) { b = 1; } if (c > 1) { c = 1; } if (d > 1) { d = 1; }

                gr.addColorStop(a, blackalpha);
                gr.addColorStop(b, smoke);
                gr.addColorStop(c, smoke);
                gr.addColorStop(d, blackalpha);
            }


            ctx.fillStyle = gr;
            ctx.fillRect(0, 0, size, size);

            imgs.push(cnv);

        }

        resitem.animimgs = imgs;

    }

};
//mach den _init und gib das objekt aus
    obj._init();
    return obj;
};});