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
        'ftools':       'lib/ftools'
    }
});


require([
    "jquery",
    "lodash",
    "ftools"
], function( $, _, ft) {


    window.debug = 1; // 3 = logge auch updates, 2 = Zeige Vektorlinien

    if (document.location.href == "http://localhost:4004/" || document.location.href == "http://192.168.178.27:4004/") {
        window.env = "dev";
    } else {
        window.env = "production";
    }


    $(document).ready(function() {


    });


});