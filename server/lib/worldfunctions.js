exports = module.exports = function() {

    ////

    // Vektorumwandlung -  Winkel, Betrag -> Koordinaten
    var angleAbs2vector = function(a, s) {

        var x = Math.cos((a-90) * 0.0174532) * s;
        var y = Math.sin((a-90) * 0.0174532) * s;

        return {x:x, y:y};
    };

    // Vektorumwandlung - Koordinaten -> Winkel, Betrag
    var vector2angleAbs = function(x, y) {
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

    // Winkel für Linien, die keine Richtung haben (0-179)
    var directionlessAngle = function(a) {

        a = angleInBoundaries(a);
        if(a >= 180 ) {
            a = a - 180;
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
        return { d: Math.sqrt( Math.pow(sx-px, 2) + Math.pow(sy-py, 2) ), sx: sx, sy };
    };

    // Weltobjekt updaten
    var updateObj = function(obj, statics, secselapsed) {

        if(obj) {


            var breakfaktor = 0; // Faktor um den durch eine Kollision gebremst wird
            var collided = false;

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
                            var clplist = [];
                            _.each(static.cp, function(cp) {

                                var dpp = distancePointFromPath(obj.x, obj.y, cp.x1 + static.x, cp.y1 + static.y, cp.x2 + static.x, cp.y2 + static.y);

                                if (dpp.d < obj.cr) {

                                    clplist.push({
                                        dpp: dpp,
                                        cp: cp
                                    });
                                }
                            });

                            if (clplist) {

                                // bei mehreren Kollisionen den mit dem grössten Winkelunterschied nehmen
                                var clp = _.max(clplist, function(clp) {
                                    var cp = clp.cp;
                                    var a = directionlessAngle(obj.ma) - cp.a;
                                    var b = cp.a - directionlessAngle(obj.ma);

                                    if (a < b) {
                                        return b;
                                    } else {
                                        return a;
                                    }
                                });

                                if (clp) {
                                    // !Kollision!

                                    // Einfallswinkel gleich Ausfallswinkel
                                    obj.ma = angleInBoundaries(2 * clp.a - obj.ma);




                                    //todo: Idee: Obj erst im RechtenWinkel verschieben
                                    


                                    breakfaktor = static.bf; //todo: checken ob notwendig
                                    collided = true; //todo: checken
                                }

                            }

                        }

                    }

                });
            }


            // Vektor aus aktueller Geschwindigkeit bestimmen
            var m = angleAbs2vector(obj.ma, obj.s);


            if (obj.type == "player") {

                var v = {x:0,y:0};

                var playervelocity = 5; //pro sek
                var playerrotationspeed = 3;
                var playermaxspeed = 200;

                if (obj.rturning) {
                    obj.va = angleInBoundaries(obj.va + playerrotationspeed);
                }
                if (obj.lturning) {
                    obj.va = angleInBoundaries(obj.va - playerrotationspeed);
                }

                if (!collided) { //nur wenn gerade nicht kollidiert wurde (tunneling verhindern)
                    if (obj.thrusting) {
                        v = angleAbs2vector(obj.va, playervelocity);
                    }
                    if (obj.breaking) {
                        v = angleAbs2vector( angleInBoundaries(obj.va-180), playervelocity);
                    }

                    if (obj.thrusting || obj.breaking) {
                        // Beschleunigungsvektor addieren (falls vorhanden)
                        m.x += v.x;
                        m.y += v.y;

                        // neue Werte im Objekt vermerken
                        var as = vector2angleAbs(m.x, m.y);

                        obj.s = as.s;
                        obj.ma = as.a;

                        if (obj.s > playermaxspeed) {
                            obj.s = playermaxspeed;
                        }
                    }
                }
            }


            // Änderung pro Sekunde
            obj.x += m.x * secselapsed;
            obj.y += m.y * secselapsed;


            // Geschwindigkeit durch Kollision verringern (nachdem das letzte Frame berechnet wurde)
            if (breakfaktor) {
                obj.s *= breakfaktor;
            }
        }
    };

    ////
    return {
        updateObj: updateObj,
        angleAbs2vector: angleAbs2vector,
        vector2angleAbs: vector2angleAbs,
        angleInBoundaries: angleInBoundaries,
        distancePointFromPath: distancePointFromPath,
        directionlessAngle: directionlessAngle
    };
};