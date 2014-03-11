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
        'seedrandom':   'lib/seedrandom',
        'ftools':       'lib/ftools'
    }
});


require([   "jquery",
            "lodash",
            "space",
            "socket",
            "ftools"
], function( $, _, SPACE, SOCKET, ft) {

    //noinspection JSUnresolvedVariable
    window.debug = 1; // 3 = logge auch updates, 2 = Zeige Vektorlinien

    if (document.location.href == "http://localhost:4004/" || document.location.href == "http://192.168.178.27:4004/") {
        window.env = "dev";
    } else {
        window.env = "production";
    }


    $(document).ready(function() {

        window.socket = new SOCKET("/play");
        window.space = new SPACE();

        if (!!document.createElement("canvas").getContext) {
            // API-Support ist okay

            $("#login button").bind("click", function() {

                window.socket.connect($("#username").val(), $("#password").val(), function() {

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