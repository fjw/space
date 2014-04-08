define(["lodash", "ftools"], function(_, ft) { return function(updateCallback, allLoadedCallback) {



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
        },

        bullet: {
            create: "createParticle_Bullet",
            center: {x:4, y:4}
        },

        bullethit: {
            create: "createParticle_Bullethit",
            center: {x:6, y:6}
        },

        bomb: {
            create: "createParticle_Bomb",
            center: {x:10, y:10}
        },

        bombexplosion: {
            create: "createParticle_BombExplosion",
            center: {x:10, y:10}
        },

        thruster: {
            create: "createParticle_Thruster",
            center: {x:6, y:6}
        }
    },

    percentLoaded: 0,
    complete: false,
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

    /*
        Callback: eine Ressource wurde geladen
     */
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
            this.complete = true;
            this.allLoadedCallback();
        }
    },

    /*
        lädt ein Sprite in die Library, mit Rotationsslices
     */
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

    /*
        Rotiert ein einfaches Bild ohne Slices und lädt es in die Library
     */
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


    /*
        Layer-Konfiguration
    */
    layercfg: [
        0,      // 0 - Sterne                           - ultradyn
        0.5,    // 1 - Hintergrund Statics              - modifizierte welt-translation
        1,      // 2 - Rückseiten Statics               - welt-translation
        1,      // 3 - Partikel / Effekte Hintergrund   - welt-translation
        1,      // 4 - dynamische Objekte               - welt-translation
        1,      // 5 - aktueller Spieler                - welt-translation
        1,      // 6 - Vordergrund Statics              - welt-translation
        1,      // 7 - Partikel / Effekte Vordergrund   - welt-translation
        0       // 8 - HUD                              - keine translation
    ],

    /*
        Setzt den Viewport für Zeichenoperationen, x,y ist oben links
     */
    _viewportX: 0,
    _viewportY: 0,
    _viewportW: 0,
    _viewportH: 0,
    _layerViewportX: [],
    _layerViewportY: [],
    _layerViewportCtx: null,
    setViewport: function(ctx, x, y, w, h) {
        this._layerViewportCtx = ctx;
        this._viewportX = x;
        this._viewportY = y;
        this._viewportW = w;
        this._viewportH = h;

        var _this = this;
        ft.each(this.layercfg, function(layerval, i) {
            _this._layerViewportX[i] = x * layerval;
            _this._layerViewportY[i] = y * layerval;
        });
    },

    /*
        Stacked eine Zeichen-Operation (ein bekanntes Sprite) für den nächsten Flush
     */
    _drawOperations:[],
    drawSprite: function(layer, spritename, x, y, cfg) {

        var resitem = this.resitems[spritename];
        if(resitem) {

            if (ft.isBoxOverlap(this._layerViewportX[layer], this._layerViewportY[layer], this._viewportW, this._viewportH, x, y, resitem.w, resitem.h)) {

                this._drawOperations.push({
                    layer: layer,
                    spritename: spritename,
                    x: x,
                    y: y,
                    cfg: cfg
                });

            }

        } else {
            console.error("unknown Sprite: "+spritename);
        }

    },

    /*
        Stacked eine Zeichen-Operation (ein Image oder Canvas) für den nächsten Flush
     */
    drawImage: function(layer, image, x, y) {

        if (ft.isBoxOverlap(this._layerViewportX[layer], this._layerViewportY[layer], this._viewportW, this._viewportH, x, y, image.width, image.height)) {

            this._drawOperations.push({
                layer: layer,
                image: image,
                x: x,
                y: y
            });

        }
    },

    /*
        Stacked eine Zeichen-Operation (einen Pfad) für den nächsten Flush
        //todo: !! unperformant, nur für dev !!
     */
    drawPath: function(layer, p, x, y, color, fill) {

        var w = _.max(p, function(point) { return point.x; }).x;
        var h = _.max(p, function(point) { return point.y; }).y;

        if (ft.isBoxOverlap(this._layerViewportX[layer], this._layerViewportY[layer], this._viewportW, this._viewportH, x, y, w, h)) {

            this._drawOperations.push({
                layer: layer,
                p: p,
                x: x,
                y: y,
                color: color,
                fill: fill
            });

        }

    },


    drawRect: function(layer, x, y, w, h, color, fill) {

        if (ft.isBoxOverlap(this._layerViewportX[layer], this._layerViewportY[layer], this._viewportW, this._viewportH, x, y, w, h)) {

            this._drawOperations.push({
                layer: layer,
                w: w,
                h: h,
                rect: true,
                x: x,
                y: y,
                color: color,
                fill: fill
            });

        }

    },

    drawText: function(layer, x, y, color, text, font) {

        var w = 200;
        var h = 30;

        if (ft.isBoxOverlap(this._layerViewportX[layer], this._layerViewportY[layer], this._viewportW, this._viewportH, x, y, w, h)) {

            this._drawOperations.push({
                layer: layer,
                x: x,
                y: y,
                color: color,
                text: text,
                font: font
            });

        }

    },


    /*
        Zeichnet alle gestackten Operationen auf den Bildschirm und leert den Stack
     */
    flush: function() {

        //todo: perfomance testen, fillStyle und font etc nur setzen wenn geändert oder sortieren

        // Layer clearen
        this._layerViewportCtx.clearRect(0, 0, this._viewportW, this._viewportH);

        // Sortiere alle Operationen nach Layer
        var ops = this._drawOperations.sort(function(a,b) { return a.layer - b.layer; });

        var _this = this; //todo: Performance testen, ob das mit this überhaupt sinnvoll ist
        ft.each(ops, function(item) {

            if (item.spritename) {
                // Sprite
                _this._flushSprite(item.layer, item.spritename, item.x, item.y, item.cfg);

            } else if (item.p) {
                // Pfad
                _this._flushPath(item.layer, item.p, item.x, item.y, item.color, item.fill);
            } else if (item.rect) {
                // Rect
                _this._flushRect(item.layer, item.w, item.h, item.x, item.y, item.color, item.fill);
            } else if (item.text) {
                // Text
                _this._flushText(item.layer, item.x, item.y, item.color, item.text, item.font);
            } else {
                // Image
                _this._flushImage(item.layer, item.image, item.x, item.y);

            }

        });

        //leere Oprations-Objekt
        this._drawOperations = [];
    },

    _flushRect: function(layer, w, h, x, y, color, fill) {

        var ctx = this._layerViewportCtx;
        var fx = x - this._layerViewportX[layer];
        var fy = y - this._layerViewportY[layer];

        if(fill) {
            ctx.fillStyle = color;
            ctx.fillRect(fx,fy,w,h);
        } else {
            ctx.strokeStyle = color;
            ctx.strokeRect(fx,fy,w,h);
        }

    },

    _flushText: function(layer, x, y, color, text, font) {

        var ctx = this._layerViewportCtx;
        var fx = ft.round(x - this._layerViewportX[layer]);
        var fy = ft.round(y - this._layerViewportY[layer]);

        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(text,fx,fy);

    },

    _flushPath: function(layer, p, x, y, color, fill) {

        var ctx = this._layerViewportCtx;
        var fx = x - this._layerViewportX[layer];
        var fy = y - this._layerViewportY[layer];

        ctx.beginPath();
        ft.each(p, function(point, i) {
            if( i == 0 ) {
                ctx.moveTo(point.x + fx, point.y + fy);
            } else {
                ctx.lineTo(point.x + fx, point.y + fy);
            }
        });
        ctx.closePath();

        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }

    },

    _flushSprite: function(layer, spritename, x, y, cfg) {

        var sprite = this.resitems[spritename];

        // Bildquelle wählen
        var img;
        if (cfg && cfg.back && sprite.bimg) {

            // Backimage
            img = sprite.bimg;

        } else if ( cfg && typeof(cfg.angle) != "undefined") {

            // Winkelbild //todo: performance
            img = _.min(sprite.angleimgs, function(item) { return Math.abs(cfg.angle - item.d); }).img;


        } else if ( cfg && typeof(cfg.anim) != "undefined") {

            // Animationframe
            if (cfg.anim < 0) { cfg.anim = 0; }

            if (cfg.cyclicanim) {

                // 0.9 = 0.9, 1.2 = 0.8, 2 = 0, 2.1 = 0.1, zyklisch halt, immer hin und her
                if (Math.floor(cfg.anim) % 2 == 0) {
                    cfg.anim = cfg.anim % 1;
                } else {
                    cfg.anim = 1 - (cfg.anim % 1);
                }

            } else {
                if (cfg.anim > 1) { cfg.anim = 1; } // auf letztem frame stehen bleiben
            }

            img = sprite.animimgs[ft.round(cfg.anim * (sprite.frames-1))];


        } else {

            // normales Bild
            img = sprite.img;

        }

        if(!img) {
            console.error("sprite problem: "+spritename);

            console.log("anim="+cfg.anim);
            console.log("imgindex="+ft.round(cfg.anim * (sprite.frames-1)));
            console.log("indexcount="+sprite.animimgs.length);
        } else {

            var fx = x - this._layerViewportX[layer];
            var fy = y - this._layerViewportY[layer];

            //alles klar, zeichne Bild
            var cx = 0;
            var cy = 0;
            if (sprite.center) {
                cx = sprite.center.x;
                cy = sprite.center.y;
            }

            if(cfg && cfg.alpha) {
                this._layerViewportCtx.globalAlpha = cfg.alpha;
            }

            if(cfg && cfg.zoom) {

                this._layerViewportCtx.drawImage( img,
                    (fx - cx)*cfg.zoom,
                    (fy - cy)*cfg.zoom,
                    img.width*cfg.zoom,
                    img.height*cfg.zoom
                );

            } else if(cfg && cfg.scale) {

                this._layerViewportCtx.drawImage( img,
                    fx - cx*cfg.scale,
                    fy - cy*cfg.scale,
                    img.width*cfg.scale,
                    img.height*cfg.scale
                );

            } else {


                this._layerViewportCtx.drawImage( img, fx - cx, fy - cy);

            }

            if(cfg && cfg.alpha) {
                this._layerViewportCtx.globalAlpha = 1;
            }

        }
    },

    _flushImage: function(layer, image, x, y) {

        var fx = x - this._layerViewportX[layer];
        var fy = y - this._layerViewportY[layer];

        this._layerViewportCtx.drawImage(image, fx, fy);

    },

    createParticle_Bullet: function(resitem) {

        var size = 8;

        var r = Math.floor(size/2);

        var cnv = document.createElement("canvas");
        cnv.width = size;
        cnv.height = size;

        var ctx = cnv.getContext("2d");

        var innercolor = '#fdf';
        var outercolor = 'rgba(255,50,255,0.5)';
        var coloralpha = 'rgba(255,50,255,0.5)';
        var blackalpha = 'rgba(0,0,0,0)';

        var gr = ctx.createRadialGradient(r, r ,0, r, r, 6);

        gr.addColorStop(0, blackalpha);

        var a, b, c, d;

        a = 0;
        b = 0.6;
        c = 0.7;
        d = 0.75;

        gr.addColorStop(a, innercolor);
        gr.addColorStop(b, outercolor);
        gr.addColorStop(c, coloralpha);
        gr.addColorStop(d, blackalpha);

        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, size, size);

        resitem.img = cnv;

    },

    createParticle_Bullethit: function(resitem) {

        var size = 12;
        var frames = 10;

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
            var innercolor = '#fdf';
            var outercolor = 'rgba(255,50,255,0.5)';
            var smoke = 'grey';

            var gr = ctx.createRadialGradient(r, r ,0, r, r, r);

            gr.addColorStop(0, blackalpha);

            var p1 = 0.3;


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

            } else  {

                m = (f - p1) / (1- p1);

                a = m;
                b = m * 0.8 + 0.2;
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

    },

    createParticle_Thruster: function(resitem) {

        var size = 12;
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
            var innercolor = 'orange';
            var outercolor = '#e44';
            var smoke = '#444';

            var gr = ctx.createRadialGradient(r, r ,0, r, r, r);

            gr.addColorStop(0, blackalpha);

            var p1 = 0.7;


            var a, b, c, d, m;

            if (f < p1) {

                m = f / p1;

                a = 0;
                b = 0.8 - 0.7 * m;
                c = 1;

                if (a < 0) { a = 0; } if (b < 0) { b = 0; } if (c < 0) { c = 0; }
                if (a > 1) { a = 1; } if (b > 1) { b = 1; } if (c > 1) { c = 1; }

                gr.addColorStop(a, innercolor);
                gr.addColorStop(b, outercolor);
                gr.addColorStop(c, blackalpha);

            } else  {

                m = (f - p1) / (1- p1);

                a = m * 0.3;
                b = 0.3;
                d = 1 - m * 0.3;

                if (a < 0) { a = 0; } if (b < 0) { b = 0; } if (c < 0) { c = 0; } if (d < 0) { d = 0; }
                if (a > 1) { a = 1; } if (b > 1) { b = 1; } if (c > 1) { c = 1; } if (d > 1) { d = 1; }

                gr.addColorStop(a, blackalpha);
                gr.addColorStop(b, smoke);
                gr.addColorStop(d, blackalpha);
            }


            ctx.fillStyle = gr;
            ctx.fillRect(0, 0, size, size);

            imgs.push(cnv);

        }

        resitem.animimgs = imgs;

    },


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
                b = m * 0.8 + 0.2;
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

    },

    createParticle_Bomb: function(resitem) {

        var size = 20;
        var frames = 20;

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


            var innercolor = '#fdf';
            var outercolor = 'rgba(255,50,255,0.5)';
            var coloralpha = 'rgba(255,50,255,0.5)';
            var blackalpha = 'rgba(0,0,0,0)';

            var gr = ctx.createRadialGradient(r, r ,0, r, r, r);

            gr.addColorStop(0, blackalpha);

            var a, b, c, d;

            a = 0;
            b = 0.6 - 0.3 * f;
            c = 0.6 + 0.1 * f;
            d = 0.9 + 0.05 * f;

            if (a < 0) { a = 0; } if (b < 0) { b = 0; } if (c < 0) { c = 0; } if (d < 0) { d = 0; }
            if (a > 1) { a = 1; } if (b > 1) { b = 1; } if (c > 1) { c = 1; } if (d > 1) { d = 1; }

            gr.addColorStop(a, innercolor);
            gr.addColorStop(b, outercolor);
            gr.addColorStop(c, coloralpha);
            gr.addColorStop(d, blackalpha);

            ctx.fillStyle = gr;
            ctx.fillRect(0, 0, size, size);


            imgs.push(cnv);
        }

        resitem.animimgs = imgs;

    },

    createParticle_BombExplosion: function(resitem) {

        var size = 20;
        var frames = 20;

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
            var innercolor = '#fdf';
            var outercolor = 'rgba(255,50,255,0.5)';
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
                b = m * 0.8 + 0.2;
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