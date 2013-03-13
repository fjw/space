define(["underscore"], function(_) { return function() {
var obj = {


    resitems: {
        player: {
            uri: "/res/fighter1.png", // "/res/ship2.gif",
            center: {x:25, y:25},
            //rotations: true,
            spriterotframes: 1, // Zeile in der die Frames sind
            w: 50,
            h: 50
        },

        walltest: {
            uri: "/res/walltest.png",
            center: {x:0, y:0}
        },

        station: {
            uri: "/res/stationt.png",
            buri: "/res/stationb.png"
        },

        gasplanet1: {
            uri: "/res/gasplanet1.png"
        },

        explosion: {
            create: "createParticle_Explosion"
        }
    },

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

                };
            }

            if(item.create) {
                //Partikel erzeugen
                _this[item.create](item);

            }

        });
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

    drawSprite: function(ctx, sprite, x, y, cfg) {

        var sprite = this.resitems[sprite];

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
                img = sprite.animimgs[cfg.anim];

            } else {

                // normales Bild
                img = sprite.img;

            }

            if(!img) {
                this.drawErrorPlaceholder(ctx,x,y);
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
                        Math.round((img.width)*cfg.zoom),
                        Math.round((img.height)*cfg.zoom)
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

    createParticle_Explosion: function(resitem) {

        var imgs = [];
        for(var f = 0; f < 30; f++) {

            var cnv = document.createElement("canvas");
            var ctx = cnv.getContext("2d");
            ctx.clearRect(0, 0, 20, 20);

            var blackalpha = 'rgba(0,0,0,0)';
            var innercolor = 'yellow';
            var outercolor = 'orange';
            var smoke = 'grey';

            var gr = ctx.createRadialGradient(5, 5 ,0, 5, 5, 10);

            gr.addColorStop(0, blackalpha);

            var p1 = 0.3;
            var p2 = 0.7;


            var a, b, c, d, m;

            if (f < p1) {

                m = f / p1;

                a = 0;
                b = 0.6 * m;
                c = m;

                if (a < 0) { a = 0; } if (b < 0) { b = 0; } if (c < 0) { c = 0; } if (d < 0) { d = 0; }
                if (a > 1) { a = 1; } if (b > 1) { b = 1; } if (c > 1) { c = 1; } if (d > 1) { d = 1; }

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
            ctx.fillRect(0, 0, cnv.width, cnv.height);

            imgs.push(cnv);
        }

        resitem.animimgs = imgs;

    }

};
//mach den _init und gib das objekt aus
    obj._init();
    return obj;
};});