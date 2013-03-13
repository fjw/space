/*!
 *  Copying or Distribution without permission is forbidden.
 *  Copyright 2013 - Frederic Worm
 *  ----------------------------------------------------------------------------------------
 */

require.config({
    paths: {
        'jquery':       'lib/jquery',
        'underscore':   'lib/underscore',
        'socketio':     'lib/socketio'
    }
});


require([   "jquery",
    "underscore",
    "res"
], function( $, _, RES) {

    var res = new RES();


    var cnv = $("#test")[0];
    var ctx = cnv.getContext("2d");

    var x = 10;
    var y = 10;


    var drawFrame = function(f) {
        var ctx = cnv.getContext("2d");
        ctx.clearRect(0, 0, 20, 20);

        var blackalpha = 'rgba(0,0,0,0)';
        var innercolor = 'yellow';
        var outercolor = 'orange';
        var smoke = 'grey';

        var gr = ctx.createRadialGradient(x, y ,0, x, y, 10);

        gr.addColorStop(0, blackalpha);

        var p1 = 0.3;
        var p2 = 0.7;


        var a, b, c, d;

        if (f < p1) {
            var m = f / p1;

            a = 0;
            b = 0.6 * m;
            c = m;

            if (a < 0) { a = 0; } if (b < 0) { b = 0; } if (c < 0) { c = 0; } if (d < 0) { d = 0; }
            if (a > 1) { a = 1; } if (b > 1) { b = 1; } if (c > 1) { c = 1; } if (d > 1) { d = 1; }

            gr.addColorStop(a, innercolor);
            gr.addColorStop(b, outercolor);
            gr.addColorStop(c, blackalpha);

        } else if ( f < p2 ) {
            var m = (f - p1) / (p2 - p1);

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
            var m = (f - p2) / (1 - p2);

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
        //ctx.arc(r, r, r, Math.PI*2, false);
        ctx.fillRect(0, 0, cnv.width, cnv.height);

        if (0) {
            ctx.strokeStyle= "#fff";
            ctx.beginPath();
            ctx.arc(x, y, 40, Math.PI*2, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x, y, 10, Math.PI*2, false);
            ctx.stroke();
        }

    };

    var mf = 30;
    var f = 0;
    var inte = setInterval(function() {
        drawFrame(f / mf);
        f++

        if (f == mf) { f = 0; }
    }, 50);
});