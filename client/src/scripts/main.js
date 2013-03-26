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


        // Interface ---------------------------------------------------
        var startInterface = function() {

            var $interface = $("#interface");

            var activetab = $(".tabbutton.active", $interface).attr("data-id");

            $(".tabmain", $interface).hide();
            $(".tabmain[data-id="+activetab+"]", $interface).show();

            $interface.fadeIn(600);

            $(".tabbutton", $interface).bind("click", function() {

                activetab = $(this).attr("data-id");
                $(".tabbutton", $interface).removeClass("active");
                $(this).addClass("active");
                $(".tabmain", $interface).hide();
                $(".tabmain[data-id="+activetab+"]", $interface).show();

            });


            $(".launch", $interface).bind("click", function() {

                //start game
                console.log("start");

            });


        };


        // Login -------------------------------------------------------
        var $login = $("#login");
        if($login) {

            //auf Seiten mit Login-Maske
            window.socket = new SOCKET();
            window.socket.connect(function() {

                $("#connecting").fadeOut(300, function() {

                    $login.fadeIn(300);

                });

            });

            $("#userloginform").bind("submit", function(){

                var $form = $("#userloginform");

                var username = $("#username", $form).val();
                var password = $("#password", $form).val();

                window.socket.auth(username, password, function(err) {

                    if (err) {
                        var $ferr = $(".formerror", $form);
                        $ferr.html(err);
                        $ferr.fadeIn(100);
                    } else {

                        //alles passt, bin eingeloggt, lade spielmarkup
                        $.ajax("/res/interface.html").done(function(data){
                            $("body").append(data);

                            //Seite ausfaden, Interface einfaden
                            $("#site").fadeOut(600, function() {
                                startInterface();
                            })
                        });


                    }

                });

                return false;
            });
        }
        // -------------------------------------------------------


    });


});