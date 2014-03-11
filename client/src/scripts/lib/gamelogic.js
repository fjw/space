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

    var setactioncode = function(action, ao) {

        switch(action) {

            case "t1":
                ao.thrusting = true;
                break;
            case "t0":
                ao.thrusting = false;
                break;
            case "b1":
                ao.breaking = true;
                break;
            case "b0":
                ao.breaking = false;
                break;

            case "r1":
                ao.rturning = true;
                break;
            case "r0":
                ao.rturning = false;
                break;
            case "l1":
                ao.lturning = true;
                break;
            case "l0":
                ao.lturning = false;
                break;

            case "s1":
                ao.stopping = true;
                break;
            case "s0":
                ao.stopping = false;
                break;

            case "sa1":
                ao.shooting = true;
                break;
            case "sa0":
                ao.shooting = false;
                break;

            case "sb1":
                ao.shooting2 = true;
                break;
            case "sb0":
                ao.shooting2 = false;
                break;

            case "as":
                ao.thrusting = false;
                ao.breaking = false;
                ao.rturning = false;
                ao.lturning = false;
                ao.stopping = false;
                ao.shooting = false;
                ao.shooting2 = false;
                break;

        }

        return ao;

    };

    /* ---------------------------------------------------------------------------------------------- */


    /*
        Wendet Userbasierte Änderungen auf ein PlayerObjekt an.

        Änderungen des Status kommen aus dem Actionstack.
     */
    var setPlayerActions = function(obj, astack) {

        //neue Action
        var playeractionstack = astack[obj.name];

        if (playeractionstack) {

            for( var i = 0; i < playeractionstack.length; i++ ) {

                setactioncode(playeractionstack[i].action, obj);
                obj.lastaction = playeractionstack[i].num;
            }

        }

    };

    /*
        Wendet Änderungen auf einen Player an
    */
    var updatePlayerObject = function(cfg, obj, secselapsed) {

        //Actions anwenden
        var v = {x:0,y:0};

        if (obj.rturning) {
            obj.va = vector.angleInBoundaries(obj.va + cfg.playerrotationspeed * secselapsed);
        }
        if (obj.lturning) {
            obj.va = vector.angleInBoundaries(obj.va - cfg.playerrotationspeed * secselapsed);
        }

        if (obj.thrusting) {
            v = vector.angleAbs2vector(obj.va, cfg.playeracceleration * secselapsed );
        }
        if (obj.breaking) {
            v = vector.angleAbs2vector( vector.angleInBoundaries(obj.va-180), cfg.playerbackacceleration * secselapsed );
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

            if (obj.s > cfg.playermaxspeed) {
                obj.s = cfg.playermaxspeed;
            }
        }

        if (obj.stopping) {
            obj.s = obj.s - cfg.playerstopacceleration * secselapsed;
            if (obj.s < 5) { obj.s = 0; }
        }

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

    /* ---------------------------------------------------------------------------------------------- */

    /*
        Aktualisiert ein Objekt in der Welt und wendet phys. Änderungen an
     */
    exports.updateObj = function(cfg, obj, secselapsed, astack) { //todo: umstellen auf millisecs


        if(obj.cr) {
            //this._checkStaticCollisions(obj, secselapsed, thistime);
        }


        if(obj.type == "player") {
            //this._checkPlayerCollisions(obj, secselapsed, thistime);
            setPlayerActions(obj,astack);
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







