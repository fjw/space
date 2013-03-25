/*!
 *  Copying or Distribution without permission is forbidden.
 *  Copyright 2013 - Frederic Worm
 *  ----------------------------------------------------------------------------------------
 */

require.config({
    paths: {
        'jquery':       'lib/jquery',
        'lodash':       'lib/lodash',
        'seedrandom':   'lib/seedrandom',
        'ftools':       'lib/ftools',
        'msgpack':      'lib/msgpack'
    }
});


require([
    "jquery",
    "lodash",
    "ftools",
    "socket"
], function( $, _, ft, SOCKET) {

    // ---------

    window.debug = 1; // 3 = logge auch updates, 2 = Zeige Vektorlinien

    if (document.location.href == "http://localhost:4004/" || document.location.href == "http://192.168.178.27:4004/") {
        window.env = "dev";
    } else {
        window.env = "production";
    }

    // ---------

    $(document).ready(function() {


        var $login = $("#login");


        if($login) {

            //auf Seiten mit Login-Maske
            window.socket = new SOCKET();
            window.socket.connect(function() {

                $("#connecting").fadeOut(300, function() {

                    $login.fadeIn(300);

                });


            });

        }


    });


});