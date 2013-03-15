/*!
 *  Copying or Distribution without permission is forbidden.
 *  Copyright 2013 - Frederic Worm
 *  ----------------------------------------------------------------------------------------
 */

require.config({
    paths: {
        'jquery':       'lib/jquery',
        'lodash':       'lib/lodash',
        'socketio':     'lib/socketio',
        'ftools':       'lib/ftools'
    }
});


require([   "jquery",
            "lodash",
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


        var innercolor = '#fdf';
        var outercolor = 'rgba(255,50,255,0.5)';
        var coloralpha = 'rgba(255,50,255,0.5)';
        var blackalpha = 'rgba(255,0,255,0)';

        var gr = ctx.createRadialGradient(x, y ,0, x, y, 5);

        gr.addColorStop(0, blackalpha);

        var a, b, c, d;

        a = 0;
        b = 0.6;
        c = 0.7;
        d = 1;

        gr.addColorStop(a, innercolor);
        gr.addColorStop(b, outercolor);
        gr.addColorStop(c, coloralpha);
        gr.addColorStop(d, blackalpha);

        ctx.fillStyle = gr;
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