/*!
 *  Copying or Distribution without permission is forbidden.
 *  Copyright 2013 - Frederic Worm
 *  ----------------------------------------------------------------------------------------
 */

require.config({
    paths: {
        'jquery':       'lib/jquery',
        'underscore':   'lib/underscore',
        'socketio':     'lib/socketio',
        'seedrandom':   'lib/seedrandom'
    }
});


require([   "jquery",
            "underscore",
            "space",
            "socket",
            "numeric"
], function( $, _, SPACE, SOCKET, NUMERIC) {

    window.debug = 1; // 3 = logge auch updates, 2 = Zeige Vektorlinien

    if (document.location.href == "http://localhost:4004/") {
        window.env = "dev";
    } else {
        window.env = "production";
    }


    $(document).ready(function() {

        window.socket = new SOCKET("/play");
        window.space = new SPACE();
        window.num = new NUMERIC();

        if (!!document.createElement("canvas").getContext) {
            // API-Support ist okay

            $("#login button").bind("click", function() {

                window.socket.connect($("#username").attr("value"), $("#password").attr("value"), function() {

                    $("#login").fadeOut(100, function() {

                        $("canvas").fadeIn(100);
                        window.space.start();

                    });

                });


            });

            //@todo: DEV ONLY
            if(window.env == "dev") {
                $("#login button").click();
            }


        } else {
            console.log("this browser sucks...");
        }


    });


});