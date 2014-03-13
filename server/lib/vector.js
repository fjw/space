exports = module.exports = function() {

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


    this.getRandomNumber = function(min, max) {
        return Math.round(min + (Math.random()*(max-min)));
    };

    this.getRandomFloat = function(min, max) {
        return min + (Math.random()*(max-min));
    };

    return this;
};