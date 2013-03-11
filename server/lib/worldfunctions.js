exports = module.exports = function() {

    ////

    // Vektorumwandlung -  Winkel, Betrag -> Koordinaten
    var angleAbs2vector = function(a, s) {

        var x = Math.cos((a-90) * 0.0174532) * s;
        var y = Math.sin((a-90) * 0.0174532) * s;

        return {x:x, y:y};
    };

    // Vektorbetrag
    var vectorAbs = function(x, y) {
        return Math.sqrt(x*x + y*y);
    };


    // Vektorumwandlung - Koordinaten -> Winkel, Betrag
    var vector2angleAbs = function(x, y) {
        var s = vectorAbs(x,y);

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
        var dx = x2 - x1;
        var dy = y2 - y1;

        var a = ( dx*(px-x1) + dy*(py-y1) ) / ( dx*dx + dy*dy );

        var sx, sy;

        if (a < 0) {
            //links von der strecke, nehme x1
            sx = x1; sy = y1;
        } else if (a > 1) {
            //rechts von der strecke nehme x2
            sx = x1; sy = y1;
        } else {
            //innerhalb der strecke, nehme den schnittpunkt der normalen
            sx = x1 + a * dx;
            sy = y1 + a * dy;
        }

        //Abstand
        var d = Math.sqrt( Math.pow(sx-px, 2) + Math.pow(sy-py, 2) );
        return { d: d, sx: sx, sy:sy };
    };

    // Weltobjekt updaten
    var updateObj = function(obj, statics, secselapsed) {

        if(obj) {


            var collided = false;

            // Kollision mit static finden
            if (obj.cr) {
                // dieses Object hat cr => kann kollidieren

                _.each(statics, function(stat) {

                    if (stat.cp && !collided) {
                        // dieser static hat cp => kann kollidieren
                        // es kann immer nur mit EINEM static pro Loop kollidiert werden!

                        if(obj.x + obj.cr > stat.x &&
                           obj.x - obj.cr < stat.x + stat.w &&
                           obj.y + obj.cr > stat.y &&
                           obj.y - obj.cr < stat.y + stat.h) {


                            // in Reichweite dieses statics, checke ob pfade kollidieren
                            var clplist = [];
                            _.each(stat.cp, function(cp) {

                                var dpp = distancePointFromPath(obj.x, obj.y, cp.x1 + stat.x, cp.y1 + stat.y, cp.x2 + stat.x, cp.y2 + stat.y);

                                if (dpp.d < obj.cr) {

                                    clplist.push({
                                        dpp: dpp,
                                        cp: cp
                                    });
                                }
                            });

                            if (clplist.length > 0) {

/*                              //todo: entfernen wenn alles nach der neuen methode gut funktioniert
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
                                    obj.ma = angleInBoundaries(2 * clp.cp.a - obj.ma);

                                    // Objekt im rechten Winkel verschieben aus dem Kollisionsradius schieben
                                    var cdx = obj.x - clp.dpp.sx;
                                    var cdy = obj.y - clp.dpp.sy;
                                    var b = vectorAbs(cdx, cdy);
                                    obj.x = clp.dpp.sx + (cdx / b * obj.cr);
                                    obj.y = clp.dpp.sy + (cdy / b * obj.cr);

                                    obj.s *= 0.9;
                                    collided = true;
                                }
*/


                                var clpa, sx, sy;
                                if (clplist.length > 1) {
                                    //mehrere Kollisionen, zwischenwinkel ermitteln
                                    var sum = _.reduce(clplist, function(memo, item){ return memo + directionlessAngle(item.cp.a); }, 0);
                                    clpa = sum / clplist.length;

                                    var xsum = _.reduce(clplist, function(memo, item){ return memo + item.dpp.sx; }, 0);
                                    sx = xsum / clplist.length;

                                    var ysum = _.reduce(clplist, function(memo, item){ return memo + item.dpp.sy; }, 0);
                                    sy = ysum / clplist.length;

                                } else {
                                    clpa = clplist[0].cp.a;
                                    sx = clplist[0].dpp.sx;
                                    sy = clplist[0].dpp.sy;
                                }

                                // !Kollision!

                                // Einfallswinkel gleich Ausfallswinkel
                                obj.ma = angleInBoundaries(2 * clpa - obj.ma);

                                // Objekt im rechten Winkel verschieben aus dem Kollisionsradius schieben
                                var cdx = obj.x - sx;
                                var cdy = obj.y - sy;
                                var b = vectorAbs(cdx, cdy);
                                obj.x = sx + (cdx / b * (obj.cr + 2)); // 2 mehr für die spitzen winkel //todo: klappt das so?
                                obj.y = sy + (cdy / b * (obj.cr + 2));

                                obj.s *= 0.9;
                                collided = true;

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
                var playerbackvelocity = 3;
                var playerrotationspeed = 3;
                var playermaxspeed = 300;

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
                        v = angleAbs2vector( angleInBoundaries(obj.va-180), playerbackvelocity );
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

                    if (obj.breakingtostop) {
                        obj.s = obj.s * 0.99;
                        if (obj.s < 2) { obj.s = 0; }
                    }

                }
            }


            // Änderung pro Sekunde
            obj.x += m.x * secselapsed;
            obj.y += m.y * secselapsed;

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