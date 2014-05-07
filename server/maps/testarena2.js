exports = module.exports = {

    // Weltconfig (mapspezifische überschreibt globale)
    cfg: {},

    exits: [
        {
            a: 225, // Winkel
            d: "testarena" // Ziel
        }
    ],

    // statische Objekte der Welt
    statics: [

        //Planet1
        {
            type: "gasplanet1",
            x: 0, y: 0,
            bg: true //Hintergrund Modifier
        },


        //gekippte Würfel
        {
            type: "ni", x: -400, y: -300,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 0, y: -300,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 400, y: -300,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        //gekippte Würfel
        {
            type: "ni", x: -400, y: 0,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 0, y: 0,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 400, y: 0,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        //gekippte Würfel
        {
            type: "ni", x: -400, y: 300,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 0, y: 300,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 400, y: 300,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        }



    ]

};