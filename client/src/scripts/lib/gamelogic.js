( // Module boilerplate to support browser globals and browserify and AMD.
    typeof define === "function" ? function (m) { define("gamelogic", m); } :
        typeof exports === "object" ? function (m) { module.exports = m(); } :
            function(m){ this.gamelogic = m(); }
    )(function () {


    var exports = {};

    /* ---------------------------------------------------------------------------------------------- */
    /*
        Vektorfunktionen
     */
    var vector = exports.vector = new function() {

        // Vektorumwandlung -  Winkel, Betrag -> Koordinaten
        this.angleAbs2vector = function(a, s) {

            var x = Math.cos((a-90) * 0.0174532) * s;
            var y = Math.sin((a-90) * 0.0174532) * s;

            return {x:x, y:y};
        };

        // Vektorbetrag
        this.vectorAbs = function(x, y) {
            return Math.sqrt(x*x + y*y);
        };


        // Vektorumwandlung - Koordinaten -> Winkel, Betrag
        this.vector2angleAbs = function(x, y) {
            var s = this.vectorAbs(x,y);

            var a = 0;
            if ( x >= 0) {
                a = Math.atan(y / x) / 0.0174532 + 90;
            } else {
                a = Math.atan(y / x) / 0.0174532 - 90;
            }

            return { s: s, a: this.angleInBoundaries(a) };
        };

        // Winkel in Grenzbereich bringen (0-359)
        this.angleInBoundaries = function(a) {
            if (a >= 360) {
                a = a - 360;
            }
            if (a < 0) {
                a = a + 360;
            }
            return a;
        };

        // Winkel für Linien, die keine Richtung haben (0-179)
        this.directionlessAngle = function(a) {

            a = this.angleInBoundaries(a);
            if(a >= 180 ) {
                a = a - 180;
            }

            return a;
        };

        // Abstand eines Punkts von einer Linie errechnen
        this.distancePointFromPath = function(px, py, x1, y1, x2, y2) {
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


        this.isBoxOverlap = function(x1, y1, w1, h1, x2, y2, w2, h2) {

            return (x1 <= x2+w2 &&
                x2 <= x1+w1 &&
                y1 <= y2+h2 &&
                y2 <= y1+h1);
        };


        return this;
    };

    /* ---------------------------------------------------------------------------------------------- */


    /*
        Wendet Änderungen auf einen Player an
    */
    var updatePlayerObject = function(cfg, obj, secselapsed) {

        var v = {x:0,y:0};
        var cfgp = cfg.player;

        // Drehen
        if (obj.rturning) {
            obj.va = vector.angleInBoundaries(obj.va + cfgp.rotationspeed * secselapsed);
        }
        if (obj.lturning) {
            obj.va = vector.angleInBoundaries(obj.va - cfgp.rotationspeed * secselapsed);
        }

        // Beschleunigen / Bremsen
        if (obj.thrusting) {
            v = vector.angleAbs2vector(obj.va, cfgp.acceleration * secselapsed );
        }
        if (obj.breaking) {
            v = vector.angleAbs2vector( vector.angleInBoundaries(obj.va-180), cfgp.backacceleration * secselapsed );
        }


        if (obj.thrusting || obj.breaking) {
            // Beschleunigungsvektor addieren (falls vorhanden)
            var m = vector.angleAbs2vector(obj.ma, obj.s);

            m.x += v.x;
            m.y += v.y;

            // neue Werte im Objekt vermerken
            var as = vector.vector2angleAbs(m.x, m.y);

            obj.s = as.s;
            obj.ma = as.a;

            if (obj.s > cfgp.maxspeed) {
                obj.s = cfgp.maxspeed;
            }
        }


        // Bremsen (zum Stoppen)
        if (obj.stopping) {
            obj.s = obj.s - cfgp.stopacceleration * secselapsed;
            if (obj.s < 5) { obj.s = 0; }
        }

        // Energie aufladen
        obj.e += cfgp.energygen * secselapsed;
        if (obj.e > cfgp.maxenergy) { obj.e = cfgp.maxenergy; }

    };


    /*
        Bewegt ein Objekt in der Welt weiter
     */
    var updatePosition = function(cfg, obj, secselapsed) {

        // Vektor aus aktueller Geschwindigkeit bestimmen
        var m = vector.angleAbs2vector(obj.ma, obj.s);

        // Änderung pro Sekunde
        obj.x += m.x * secselapsed;
        obj.y += m.y * secselapsed;

    };


    /*
        Prüft die Kollision eines dynamischen Objekts mit einem static (Abpraller)
    */
    var checkStaticCollisions = function(cfg, obj, statics) {


        var collided = false;

        for( var i = 0, len = statics.length; i < len; i++ ) {

            var stat = statics[i];

            // dieser static hat cp? => kann kollidieren?
            // es kann immer nur mit EINEM static pro Loop kollidiert werden!
            // Reichweite abchecken durch BoundingBox
            if( stat.cps && !collided && vector.isBoxOverlap(obj.x - obj.cr, obj.y - obj.cr,
                obj.cr * 2, obj.cr * 2,
                stat.x, stat.y,
                stat.w, stat.h)) {


                // Kollisionen suchen
                var clplist = [];
                _.each(stat.cps, function(cp) {
                    var dpp = vector.distancePointFromPath(obj.x, obj.y, cp.x1 + stat.x, cp.y1 + stat.y, cp.x2 + stat.x, cp.y2 + stat.y);

                    if (dpp.d < obj.cr) {

                        clplist.push({
                            dpp: dpp,
                            cp: cp
                        });
                    }
                });

                if (clplist.length > 0) {

                    var clpa, sx, sy;
                    if (clplist.length > 1) {
                        //mehrere Kollisionen, zwischenwinkel ermitteln
                        var sum = _.reduce(clplist, function(memo, item){ return memo + vector.directionlessAngle(item.cp.a); }, 0);
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
                    obj.ma = vector.angleInBoundaries(2 * clpa - obj.ma);

                    // Objekt im rechten Winkel verschieben aus dem Kollisionsradius schieben
                    var cdx = obj.x - sx;
                    var cdy = obj.y - sy;
                    var b = vector.vectorAbs(cdx, cdy);
                    obj.x = sx + (cdx / b * (obj.cr + 2)); // 2 mehr für die spitzen winkel
                    obj.y = sy + (cdy / b * (obj.cr + 2));

                    obj.s *= cfg.staticbouncefactor;
                    collided = true;

                    // Explosion?
                    if(cfg.projectiles && cfg.projectiles[obj.type] && cfg.projectiles[obj.type].explosionparticles) {
                        obj.exploding = true;
                    }

                }

            }


            if (collided) {
                break;
            }

        }

    };

    /* ---------------------------------------------------------------------------------------------- */
    /* ---------------------------------------------------------------------------------------------- */
    /* ---------------------------------------------------------------------------------------------- */
    /* ---------------------------------------------------------------------------------------------- */

    /*
        Aktualisiert ein Objekt in der Welt und wendet phys. Änderungen an
     */
    exports.updateObj = function(cfg, obj, secselapsed, statics) {


        if(obj.cr) {
            checkStaticCollisions(cfg, obj, statics);
        }


        if(obj.type == "player") {

            //checkPlayerCollisions(obj, secselapsed, thistime);
            updatePlayerObject(cfg, obj, secselapsed);
        }


        if(obj.s) {
            updatePosition(cfg, obj, secselapsed);
        }



        if (obj.deleted) {
            return null;
        } else {
            return obj;
        }

    };

    return exports;

});







