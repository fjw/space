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
        'msgpack':      'lib/msgpack',
        'gamelogic':    'lib/gamelogic'
    }
});


require([
    "jquery",
    "lodash",
    "ftools",
    "socket",
    "res",
    "space"
], function( $, _, ft, SOCKET, RES, SPACE) {


    window.debug = 1; // 3 = logge auch updates, 2 = Zeige Vektorlinien

    if (document.location.href == "http://localhost:8090/" ||
        document.location.href == "http://192.168.178.27:8090/" ||
        document.location.href == "http://bitbox:8090/") {

        window.env = "dev";
    } else {
        window.env = "production";
        window.debug = 0;
    }

    // ---------

    var fadespeed = 100;

    // ---------


    $(document).ready(function() {

        // Error --------------------------------------------------
        window.errorMsg = function(msg, title) {

            var $error = $("#error");

            if ($error.length == 0) {
                $error = $('<div id="error" style="display:none"><div class="title"></div><div class="msg"></div></div>');
                $('body').append($error);
            }


            if (!title) { title = "error"; }

            $('.title', $error).html(title);
            $('.msg', $error).html(msg);

            $error.fadeIn(fadespeed);

        };


        // Game ---------------------------------------------------
        var startGame = function() {

            // Interface entfernen
            $("#interface").remove();

            if(!window.space) {
                window.space = new SPACE();
                window.space.start();
            }


        };


        // Interface ---------------------------------------------------
        var startInterface = function() {

            // Site entfernen
            $("#site").remove();

            // regelmässig Pingen
            var pingInterval = window.setInterval(function() {

                window.socket.ping(function(ping) {

                    $("#ping").html(ping);

                });

            }, 5000);


            // Ressourcen laden
            var resloaded = false;
            if(!window.res) {
                window.res = new RES(
                    function(per) {
                        var $resloaded = $(".resloaded", $interface);
                        var $percent = $(".percent", $resloaded);
                        $percent.css("width", $resloaded.width() * per);
                    },
                    function() {
                        resloaded = true;
                        $(".launchgame", $interface).removeClass("disabled");
                    }
                );
            }


            var $interface = $("#interface");

            var activetab = $(".tabbutton.active", $interface).attr("data-id");

            $(".tabmain", $interface).hide();
            $(".tabmain[data-id="+activetab+"]", $interface).show();

            $interface.fadeIn(fadespeed);

            $(".tabbutton", $interface).bind("click", function() {

                activetab = $(this).attr("data-id");
                $(".tabbutton", $interface).removeClass("active");
                $(this).addClass("active");
                $(".tabmain", $interface).hide();
                $(".tabmain[data-id="+activetab+"]", $interface).show();

            });


            var started = false;
            $(".launchgame", $interface).bind("click", function() {
                if (resloaded && !started) {
                    started = true;
                    $interface.fadeOut(fadespeed, function() {

                        if(pingInterval) {
                            window.clearInterval(pingInterval);
                        }

                        startGame();
                    });
                }
            });


        };


        // Login -------------------------------------------------------
        var $login = $("#login");
        if($login) {

            //auf Seiten mit Login-Maske
            window.socket = new SOCKET();
            window.socket.connect(function() {

                $("#connecting").fadeOut(fadespeed, function() {

                    $login.fadeIn(fadespeed);

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
                        $ferr.fadeIn(fadespeed);
                    } else {

                        //alles passt, bin eingeloggt, lade spielmarkup
                        $.ajax("/res/interface.html").done(function(data){
                            $("body").append(data);

                            //Seite ausfaden, Interface einfaden
                            $("#site").fadeOut(fadespeed, function() {
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