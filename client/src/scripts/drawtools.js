define(["underscore"], function(_) { return {

    increaseColorBrightness: function(hex, percent){
        if(hex.length == 4) {
            var r = parseInt(hex.substr(1, 1)+hex.substr(1, 1), 16),
                g = parseInt(hex.substr(2, 1)+hex.substr(2, 1), 16),
                b = parseInt(hex.substr(3, 1)+hex.substr(3, 1), 16);
        } else {
            var r = parseInt(hex.substr(1, 2), 16),
                g = parseInt(hex.substr(3, 2), 16),
                b = parseInt(hex.substr(5, 2), 16);
        }

        return '#' +
            ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
            ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
            ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
    },

    createRoundedRectPath: function(ctx, x1, y1, x2, y2, r) {
        ctx.beginPath();
        ctx.moveTo(x1 + r, y1);
        ctx.lineTo(x2 - r, y1);
        ctx.quadraticCurveTo(x2, y1, x2, y1 + r);
        ctx.lineTo(x2, y2 - r);
        ctx.quadraticCurveTo(x2, y2, x2 - r, y2);
        ctx.lineTo(x1 + r, y2);
        ctx.quadraticCurveTo(x1, y2, x1, y2 - r);
        ctx.lineTo(x1, y1 + r);
        ctx.quadraticCurveTo(x1, y1, x1 + r, y1);
        ctx.closePath();
    },

    createRoundedConicalPath: function(ctx, x1, y1, w1, w2, h, r) {
        var diff = Math.floor((w1 - w2) / 2);
        ctx.beginPath();
        ctx.moveTo(x1 + r, y1);
        ctx.lineTo(x1 + w1 - r, y1);
        ctx.quadraticCurveTo(x1 + w1, y1, x1 + w1, y1 + r);
        ctx.lineTo(x1 + w1 - diff, y1 + h );
        //ctx.quadraticCurveTo(x1 + w1 - diff, y1 + h, x1 + w1 - diff - r, y1 + h);
        ctx.lineTo(x1 + diff, y1 + h);
        //ctx.quadraticCurveTo(x1 + diff, y1 + h, x1 + diff, y1 + h - r);
        ctx.lineTo(x1, y1 + r);
        ctx.quadraticCurveTo(x1, y1, x1 + r, y1);
        ctx.closePath();
    },

    drawCircle: function(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0 , 2 * Math.PI, false);
        ctx.closePath();
    },

    createDashedPath: function(ctx, x1, y1, x2, y2, dashLen) {

        ctx.moveTo(x1, y1);

        var dX = x2 - x1;
        var dY = y2 - y1;
        var dashes = Math.sqrt(dX * dX + dY * dY) / dashLen;
        var dashX = dX / dashes;
        var dashY = dY / dashes;

        var q = 0;
        while (q++ < dashes - 1) {
            x1 += dashX;
            y1 += dashY;
            ctx[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
        }
        ctx[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);

    },

    drawDashedArrowPath:  function(ctx, x1, y1, x2, y2, headlen, wide, dashLen) {

        //Einheitsvektor
        var vb = Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
        var ux = (x2-x1) / vb;
        var uy = (y2-y1) / vb;
        var angle = Math.atan2(y2-y1,x2-x1);

        ctx.beginPath();
        this.createDashedPath(ctx, x1, y1, x2 - ux * (headlen-1), y2 - uy * (headlen-1), dashLen);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headlen*Math.cos(angle-Math.PI/wide), y2 - headlen*Math.sin(angle-Math.PI/wide));
        ctx.lineTo(x2 - headlen*Math.cos(angle-Math.PI/wide), y2 - headlen*Math.sin(angle-Math.PI/wide));
        ctx.lineTo(x2 - headlen*Math.cos(angle+Math.PI/wide), y2 - headlen*Math.sin(angle+Math.PI/wide));
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

    },

    drawArrowPath:  function(ctx, x1, y1, x2, y2, headlen, wide) {

        //Einheitsvektor
        var vb = Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
        var ux = (x2-x1) / vb;
        var uy = (y2-y1) / vb;
        var angle = Math.atan2(y2-y1,x2-x1);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2 - ux * (headlen-1) , y2 - uy * (headlen-1));
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headlen*Math.cos(angle-Math.PI/wide), y2 - headlen*Math.sin(angle-Math.PI/wide));
        ctx.lineTo(x2 - headlen*Math.cos(angle-Math.PI/wide), y2 - headlen*Math.sin(angle-Math.PI/wide));
        ctx.lineTo(x2 - headlen*Math.cos(angle+Math.PI/wide), y2 - headlen*Math.sin(angle+Math.PI/wide));
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

    },

    createHexagonPath: function(ctx, x, y, r) {

        ctx.beginPath();

        var xp = x+(r/2);
        var xm = x-(r/2);

        var y0 = y-(r/2*Math.sqrt(3));
        var y1 = y+(r/2*Math.sqrt(3));

        ctx.moveTo(x+r, y);
        ctx.lineTo(xp, y1);
        ctx.lineTo(xm, y1);
        ctx.lineTo(x-r, y);
        ctx.lineTo(xm, y0);
        ctx.lineTo(xp, y0);
        ctx.closePath();

    }


};});