define(["underscore"], function(_) { return function() {
var obj = {


    imgs: {
        player: {
            uri: "/res/ship3.png", // "/res/ship2.gif",
            center: {x:18, y:18},
            rotations: true
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
        }
    },

    _init: function() {
        var _this = this;

        _.each(this.imgs, function(item) {

            item.img = new Image();
            item.img.src = item.uri;

            if (item.buri) {
                item.bimg = new Image();
                item.bimg.src = item.buri;
            }

            item.img.onload = function() {
                if(item.rotations) {
                    _this._preloadRotations(item);
                }
            };

        });
    },

    _preloadRotations: function(resitem) {

        var rotationSteps = 36;

        var mcc = document.createElement("canvas");
        mcc.width = resitem.img.width;
        mcc.height = resitem.img.height;
        var mctx = mcc.getContext("2d");
        mctx.drawImage(resitem.img, 0, 0);
        mctx.save();

        var imgs = [];
        for(var d = 0; d <= 360; d += 360 / rotationSteps) {

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

    drawSprite: function(ctx, sprite, x, y, angle, back, zoom) {

        var sprite = this.imgs[sprite];

        if (sprite) {

            var img;
            if (back && sprite.buri) {
                img = sprite.bimg;
            } else {
                img = sprite.img;
            }

            if (img.complete) {

                if(sprite.angleimgs && angle) {
                    img = _.min(sprite.angleimgs, function(item) { return Math.abs(angle - item.d); }).img;
                }

                var cx = 0;
                var cy = 0;
                if (sprite.center) {
                    cx = sprite.center.x;
                    cy = sprite.center.y;
                }

                if(zoom) {
                    ctx.drawImage( img,
                        Math.round((x - cx)*zoom),
                        Math.round((y - cy)*zoom),
                        Math.round((img.width)*zoom),
                        Math.round((img.height)*zoom)
                    );
                } else {
                    ctx.drawImage( img,
                        Math.round(x - cx),
                        Math.round(y - cy)
                    );
                }

            }

        } else {

            //kein Bild vorhanden, Platzhalter zeichnen
            ctx.fillRect(Math.round(x - 2), Math.round(y - 2), 5, 5);

        }

    }

};
//mach den _init und gib das objekt aus
    obj._init();
    return obj;
};});