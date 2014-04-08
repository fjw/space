/*!
 *  Copying or Distribution without permission is forbidden.
 *  Copyright 2013 - Frederic Worm
 *  ----------------------------------------------------------------------------------------
 */

require.config({
    paths: {
        'jquery':       'lib/jquery',
        'lodash':       'lib/lodash',
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



    /*

    cnv.width = 1000;
    cnv.height = 1000;

    var color = new Image();
    var clouds = new Image();
    var atmo = new Image();
    var shadow = new Image();

    color.src = "/res/greenplanet_color.gif";
    clouds.src = "/res/greenplanet_clouds.png";
    atmo.src = "/res/greenplanet_atmo.png";
    shadow.src = "/res/greenplanet_shadow.png";
    var once = true;

    var checkComplete = function() {
        if(color.complete && clouds.complete && atmo.complete && shadow.complete && once) {
            once = false;
            allComplete();
        }
    };

    color.onload = checkComplete;
    clouds.onload = checkComplete;
    atmo.onload = checkComplete;
    shadow.onload = checkComplete;


    function allComplete() {

        var angle = 0;

        var inte = setInterval(function() {

            ctx.clearRect(0,0,1000,1000);

            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(color, 0, 0);



            ctx.save();
            ctx.translate(530,510);

            ctx.globalCompositeOperation = "lighter";
            ctx.rotate(angle);
            ctx.drawImage(clouds, -530, -510);

            ctx.restore();

            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(shadow,0,0);
            ctx.globalCompositeOperation = "lighter";
            ctx.drawImage(atmo,0,0);

            angle = angle + 0.0002;
            if (angle >= 360) { angle -= 360; }

        }, 14);







    }

    $("canvas").css("position","static");
    $("body").css("position","static");


    */








     res.setViewport(ctx,0,0,50,50);


     var drawFrame = function(f) {

         res.drawSprite(0,"bombexplosion",10,10,{anim:f, cyclicanim: false});

         res.flush();
     };



     var mf = 60;
     var f = 0;
     var inte = setInterval(function() {
         drawFrame(f / (mf / 2));
         f++;

         if (f == mf) { f = 0; }
     }, 50);




});