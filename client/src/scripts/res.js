define(["underscore"], function(_) { return function() {
var obj = {


    imgs: {
        player: {
            uri: "/res/ship3.png",
            center: {x:18, y:18}
        },

        walltest: {
            uri: "/res/walltest.png",
            center: {x:0, y:0}
        }
    },

    _init: function() {
        var _this = this;

        _.each(this.imgs, function(item) {

            item.img = new Image();
            item.img.src = item.uri;

            item.img.onload = function() {
                _this._preloadRotations(item);
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

    drawSprite: function(ctx, sprite, x, y, angle) {

        var sprite = this.imgs[sprite];

        if (sprite && sprite.img.complete) {

            var img = sprite.img;

            if(sprite.angleimgs && angle) {
                img = _.min(sprite.angleimgs, function(item) { return Math.abs(angle - item.d); }).img;
            }

            ctx.drawImage( img,
                Math.round(x - sprite.center.x),
                Math.round(y - sprite.center.y)
            );

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