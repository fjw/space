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
            "space",
            "socket"
], function( $, _, SPACE, SOCKET) {

    window.debug = 1; // 3 = logge auch updates, 2 = Zeige Vektorlinien

    if (document.location.href == "http://localhost:4004/") {
        window.env = "dev";
    } else {
        window.env = "production";
    }


    $(document).ready(function() {

        window.socket = new SOCKET();
        window.space = new SPACE();


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