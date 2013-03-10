exports = module.exports = {

    objects: [
        {
            type: "bullet",
            x: 50, y: 10,   //Koordinaten
            ma: 0,          //Bewegungswinkel
            s: 0            //Speed
        },
        {
            type: "player", name: "testor",
            x: 5, y: 10,    //Koordinaten
            ma: 0,          //Bewegungswinkel
            s: 0,           //Speed
            va: 135,        //Sichtwinkel
            cr: 18          //Kollisionsradius
        },
        { type: "player", name: "anderor",x: 100, y: 0,  ma: 225,  s: 20, va: 225,  cr: 18  }
    ],

    statics: [
        /*
         {
         type: "walltest",
         x:-300, y:-300,       //Koordinaten
         w: 2000, h: 2000,   //Größe   //todo: w,h aus image holen
         cp: [   //Kollisionspfade
         { x1: 30,    y1: 30,    x2: 1970, y2: 30 },
         { x1: 1970,  y1: 30,    x2: 1970, y2: 1970 },
         { x1: 1970,  y1: 1970,  x2: 30,    y2: 1970 },
         { x1: 30,    y1: 1970,  x2: 30,    y2: 30 }
         ]
         },*/


        //Ein paar Hindernisse
        /*
        {
            type: "ni", // Wand ohne Bild
            x: 100, y: 100,
            p: [ // Geschlossender Pfad, Kollisionspfad wird automatisch generiert
                { x: 0, y:0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ],
            c: "#f00"
        },*/
        {
            type: "ni", x: 200, y: 200,
            p: [ { x: 0, y: 0 }, { x: 30, y: 0 }, { x: 400, y: 400 }, { x: 370, y: 400 } ],
            c: "#444"
        },



        //Seitenwände
        {
            type: "ni", x: -2000, y: -2000,
            p: [ { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 4000 }, { x: 0, y: 4000 } ],
            c: "#00f"
        },
        {
            type: "ni", x: -2000, y: -2000,
            p: [ { x: 0, y: 0 }, { x: 4000, y: 0 }, { x: 4000, y: 10 }, { x: 0, y: 10 } ],
            c: "#00f"
        },
        {
            type: "ni", x: 1990, y: -2000,
            p: [ { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 4000 }, { x: 0, y: 4000 } ],
            c: "#00f"
        },
        {
            type: "ni", x: -2000, y: 1990,
            p: [ { x: 0, y: 0 }, { x: 4000, y: 0 }, { x: 4000, y: 10 }, { x: 0, y: 10 } ],
            c: "#00f"
        }

    ]

};