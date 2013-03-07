exports = module.exports = function() {

    ////

    // Vektorumwandlung -  Winkel, Betrag -> Koordinaten
    var angleAbs2vektor = function(a, s) {

        var x = Math.cos((a-90) * 0.0174532) * s;
        var y = Math.sin((a-90) * 0.0174532) * s;

        return {x:x, y:y};
    };

    // Vektorumwandlung - Koordinaten -> Winkel, Betrag
    var vektor2angleAbs = function(x, y) {
        var s = Math.sqrt(x*x + y*y);

        var a = 0;
        if ( x >= 0) {
            a = Math.atan(y / x) / 0.0174532 + 90;
        } else {
            a = Math.atan(y / x) / 0.0174532 - 90;
        }

        return { s: s, a: angleInBoundaries(a) };
    };

    // Winkel in Grenzbereich bringen (0-359)
    var angleInBoundaries = function(a) {
        if (a >= 360) {
            a = a - 360;
        }
        if (a < 0) {
            a = a + 360;
        }
        return a;
    };

    // Abstand eines Punkts von einer Linie errechnen
    var distancePointFromPath = function(px, py, x1, y1, x2, y2) {
        var dx = x2 - x1; //j
        var dy = y2 - y1; //k

        var a = ( dx*(px-x1) + dy*(py-y1) ) / ( dx*dx + dy*dy );

        //Schnittpunkt
        var sx = x1 + a * dx;
        var sy = y1 + a * dy;

        //Abstand
        return Math.sqrt( Math.pow(sx-px, 2) + Math.pow(sy-py, 2) );
    };

    // Weltobjekt updaten
    var updateObj = function(obj, statics, secselapsed) {

        if(obj) {

            var v = {x:0,y:0}; // richtungsändernder Beschleunigungsvektor


            // Kollision mit static finden
            if (obj.cr) {
                // dieses Object hat cr => kann kollidieren

                _.each(statics, function(static) {

                    if (static.cp) {
                        // dieser static hat cp => kann kollidieren

                        if(obj.x + obj.cr > static.x &&
                           obj.x - obj.cr < static.x + static.w &&
                           obj.y + obj.cr > static.y &&
                           obj.y - obj.cr < static.y + static.h) {


                            // in Reichweite dieses statics, checke ob pfade kollidieren
                            var clp = _.find(static.cp, function(cp) {
                                var d = distancePointFromPath(obj.x, obj.y, cp.x1 + static.x, cp.y1 + static.y, cp.x2 + static.x, cp.y2 + static.y);
                                return d < obj.cr;
                            });

                            if (clp) {
                                // !Kollision!


                                var cpa = vektor2angleAbs(clp.x2-clp.x1, clp.y2-clp.y1).a; //Winkel des Pfads //todo: kann vorberechnet werden

                                //todo: manchmal bleibt er hängen ( bei annäherung von der seite oder bremsen?)


                                // Einfallswinkel gleich Ausfallswinkel
                                obj.ma = angleInBoundaries(2 * cpa - obj.ma);

                                obj.s = obj.s ; //Bremsen //todo: ?
                            }

                        }

                    }

                });
            }


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
                    v = angleAbs2vektor(obj.va, playervelocity);
                }
                if (obj.breaking) {
                    v = angleAbs2vektor( angleInBoundaries(obj.va-180), playervelocity);
                }
            }

            // Vektor aus Geschwindigkeit bestimmen
            var m = angleAbs2vektor(obj.ma, obj.s);

            if (v.x != 0 || v.y != 0) {
                // Beschleunigungsvektor addieren (falls vorhanden)
                m.x += v.x;
                m.y += v.y;

                // neue Werte im Objekt vermerken
                var as = vektor2angleAbs(m.x, m.y);

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