exports = module.exports = function() {

    ////

    var angleSpeed2vektor = function(a, s) {

        var x = Math.cos((a-90) * 0.0174532) * s;
        var y = Math.sin((a-90) * 0.0174532) * s;

        return {x:x, y:y};
    };

    var vektor2angleSpeed = function(x, y) {
        var s = Math.sqrt(x*x + y*y);

        var a = 0;
        if ( x >= 0) {
            a = Math.atan(y / x) / 0.0174532 + 90;
        } else {
            a = Math.atan(y / x) / 0.0174532 - 90;
        }

        return { s: s, a: angleInBoundaries(a) };
    };

    var angleInBoundaries = function(a) {
        if (a >= 360) {
            a = a - 360;
        }
        if (a < 0) {
            a = a + 360;
        }
        return a;
    };

    var updateObj = function(obj, secselapsed) {

        if(obj) {
            var v = {x:0,y:0};

            if (obj.type == "player") {

                var playervelocity = 5; //pro sek
                var playerrotationspeed = 3;

                if (obj.rturning) {
                    obj.va = angleInBoundaries(obj.va + playerrotationspeed);
                }
                if (obj.lturning) {
                    obj.va = angleInBoundaries(obj.va - playerrotationspeed);
                }

                if (obj.thrusting) {
                    v = angleSpeed2vektor(obj.va, playervelocity);
                }
                if (obj.breaking) {
                    v = angleSpeed2vektor( angleInBoundaries(obj.va-180), playervelocity);
                }
            }

            // Vektor aus Geschwindigkeit bestimmen
            var m = angleSpeed2vektor(obj.ma, obj.s);

            if (v.x != 0 || v.y != 0) {
                // Beschleunigungsvektor addieren (falls vorhanden)
                m.x += v.x;
                m.y += v.y;

                // neue Werte im Objekt vermerken
                var as = vektor2angleSpeed(m.x, m.y);

                obj.s = as.s;
                obj.ma = as.a;
            }

            // Änderung pro Sekunde
            obj.x += m.x * secselapsed;
            obj.y += m.y * secselapsed;
        }
    };

    ////
    return { updateObj:updateObj };
};