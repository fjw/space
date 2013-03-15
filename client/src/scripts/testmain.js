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


    res.setViewport(ctx,0,0,50,50);


    var drawFrame = function(f) {

        res.drawSprite(0,"bullethit",10,10,{anim:f});

        res.flush();
    };

    var mf = 10;
    var f = 0;
    var inte = setInterval(function() {
        drawFrame(f / mf);
        f++

        if (f == mf) { f = 0; }
    }, 50);
});