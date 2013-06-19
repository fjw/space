( // Module boilerplate to support browser globals and browserify and AMD.
    typeof define === "function" ? function (m) { define("gamelogic", m); } :
        typeof exports === "object" ? function (m) { module.exports = m(); } :
            function(m){ this.gamelogic = m(); }
    )(function () {


    var exports = {};
    //--------------------------------



    exports.update = function(foo) {
        return foo + "baa";
    };



    return exports;

});







