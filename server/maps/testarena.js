exports = module.exports = {

    // Weltconfig (mapspezifische überschreibt globale)
    cfg: {},

    // statische Objekte der Welt
    statics: [
        /*
            Beispiel:
            {
                type: "meinstatic",     // id der ressource ("ni" = static ohne Bild)
                x:-300, y:-900,         // Koordinaten
                w: 432, h: 600,         // Größe
                ps: [                   // Polygone (für Kollision)
                    [{x: 0, y: 0}, {x:0, y: 10}, {x:10, y:10}],
                    [{x: 20, y: 20}, {x:20, y: 40}, {x:40, y:40}]
                ],
                bg: false               // Objekt im Background-Layer?
            }
        */

        //Station
        {
            type: "station",
            x:-300, y:-900,       //Koordinaten
            w: 432, h: 600,   //Größe
            ps: [[
                {x:20, y: 60}, {x:3, y:70}, {x:58, y:165}, {x:23, y:268}, {x:41, y:371}, {x:124, y:457}, {x:112, y:574}, {x:132, y:580}, {x:158, y:372}, {x:241, y:386}, {x:210, y:593}, {x:228, y:594}, {x:256, y:494}, {x:354, y:442}, {x:414, y:330}, {x:404, y:201}, {x:304, y:99}, {x:173, y:92}, {x:95, y:7}, {x:85, y:17}, {x:202, y:167}, {x:121, y:221}
            ]]
        },

        //Station
        /*
        {
            type: "station",
            x:20000, y:-20000,       //Koordinaten
            w: 432, h: 600,          //Größe
            ps: [[
                {x:20, y: 60}, {x:3, y:70}, {x:58, y:165}, {x:23, y:268}, {x:41, y:371}, {x:124, y:457}, {x:112, y:574}, {x:132, y:580}, {x:158, y:372}, {x:241, y:386}, {x:210, y:593}, {x:228, y:594}, {x:256, y:494}, {x:354, y:442}, {x:414, y:330}, {x:404, y:201}, {x:304, y:99}, {x:173, y:92}, {x:95, y:7}, {x:85, y:17}, {x:202, y:167}, {x:121, y:221}

            ]]
        },
        */

        //Planet1
        {
            type: "gasplanet1",
            x: 600, y: 200,
            bg: true //Hintergrund Modifier
        },


        //Asteroiden
        {
            type: "asteroid1",
            x: -387, y: 1182,
            ps: [[
                {x:131,y:2},{x:220,y:15},{x:247,y:38},{x:255,y:68},{x:249,y:88},{x:251,y:110},{x:203,y:181},{x:200,y:200},{x:187,y:209},{x:185,y:238},{x:132,y:280},{x:114,y:283},{x:96,y:293},{x:71,y:290},{x:18,y:253},{x:0,y:204},{x:12,y:161},{x:2,y:132},{x:18,y:61},{x:56,y:21}
            ]]
        },
        {
            type: "asteroid2",
            x: -1537, y: 1220,
            ps: [[
                {x:154,y:3},{x:236,y:69},{x:257,y:121},{x:284,y:161},{x:288,y:288},{x:252,y:366},{x:211,y:381},{x:170,y:364},{x:96,y:300},{x:86,y:276},{x:33,y:242},{x:0,y:136},{x:22,y:66},{x:39,y:42},{x:67,y:6}
            ]]
        },
        {
            type: "asteroid3",
            x: -29, y: 938,
            ps: [[
                {x:161,y:2},{x:259,y:71},{x:265,y:103},{x:271,y:126},{x:306,y:161},{x:311,y:220},{x:334,y:296},{x:283,y:382},{x:255,y:393},{x:186,y:365},{x:146,y:327},{x:122,y:312},{x:117,y:290},{x:56,y:255},{x:17,y:171},{x:1,y:142},{x:5,y:83},{x:66,y:2}
            ]]
        },
        {
            type: "asteroid4",
            x: -1597, y: 884,
            ps: [[
                {x:78,y:1},{x:161,y:11},{x:233,y:62},{x:249,y:59},{x:285,y:110},{x:286,y:174},{x:252,y:212},{x:216,y:226},{x:137,y:222},{x:46,y:200},{x:19,y:164},{x:21,y:124},{x:3,y:96},{x:12,y:50},{x:34,y:45},{x:46,y:19}
            ]]
        },
        {
            type: "asteroid5",
            x: -1221, y: 1276,
            ps: [[
                {x:227,y:2},{x:250,y:18},{x:260,y:43},{x:285,y:45},{x:299,y:69},{x:299,y:108},{x:284,y:125},{x:285,y:153},{x:250,y:196},{x:83,y:223},{x:22,y:204},{x:1,y:164},{x:3,y:109},{x:24,y:64},{x:132,y:14}
            ]]
        },
        {
            type: "asteroid6",
            x: -809, y: 1422,
            ps: [[
                {x:211,y:2},{x:277,y:41},{x:288,y:77},{x:282,y:105},{x:263,y:132},{x:201,y:152},{x:174,y:182},{x:151,y:185},{x:116,y:221},{x:90,y:233},{x:60,y:230},{x:27,y:207},{x:1,y:164},{x:13,y:106},{x:25,y:100},{x:47,y:47},{x:94,y:17},{x:129,y:16},{x:167,y:2},{x:190,y:7}
            ]]
        },
        {
            type: "asteroid7",
            x: -1027, y: 700,
            ps: [[
                {x:148,y:2},{x:187,y:15},{x:214,y:72},{x:188,y:186},{x:129,y:233},{x:98,y:230},{x:75,y:232},{x:27,y:198},{x:1,y:142},{x:14,y:75},{x:39,y:37},{x:92,y:9}
            ]]
        },
        {
            type: "asteroid8",
            x: -755, y: 1056,
            ps: [[
                {x:61,y:1},{x:138,y:20},{x:154,y:33},{x:183,y:47},{x:190,y:58},{x:207,y:62},{x:232,y:106},{x:230,y:161},{x:232,y:194},{x:214,y:232},{x:170,y:256},{x:123,y:249},{x:101,y:223},{x:58,y:202},{x:26,y:168},{x:6,y:85},{x:3,y:33}
            ]]
        },
        {
            type: "asteroid9",
            x: -1877, y: 1084,
            ps: [[
                {x:62,y:1},{x:100,y:3},{x:116,y:16},{x:134,y:16},{x:160,y:38},{x:187,y:102},{x:189,y:167},{x:192,y:180},{x:181,y:219},{x:143,y:245},{x:96,y:242},{x:71,y:222},{x:27,y:195},{x:14,y:151},{x:2,y:123},{x:3,y:92},{x:17,y:69},{x:23,y:28}
            ]]
        },
        {
            type: "asteroid10",
            x: 307, y: 1868,
            ps: [[
                {x:218,y:1},{x:244,y:2},{x:260,y:9},{x:291,y:59},{x:290,y:80},{x:267,y:102},{x:232,y:162},{x:211,y:165},{x:160,y:229},{x:41,y:214},{x:6,y:178},{x:3,y:134},{x:31,y:99},{x:56,y:82},{x:62,y:61},{x:116,y:23},{x:168,y:7},{x:202,y:15}
            ]]
        },
        {
            type: "asteroid11",
            x: -95, y: 1386,
            ps: [[
                {x:152,y:5},{x:170,y:20},{x:172,y:53},{x:190,y:99},{x:187,y:133},{x:178,y:147},{x:181,y:167},{x:192,y:215},{x:140,y:268},{x:75,y:290},{x:24,y:274},{x:6,y:240},{x:10,y:201},{x:1,y:172},{x:8,y:116},{x:22,y:75},{x:44,y:52},{x:57,y:49},{x:57,y:32},{x:79,y:5}
            ]]
        },
        {
            type: "asteroid12",
            x: -521, y: 1790,
            ps: [[
                {x:113,y:1},{x:197,y:15},{x:233,y:46},{x:245,y:87},{x:240,y:102},{x:244,y:127},{x:218,y:168},{x:144,y:210},{x:69,y:194},{x:65,y:188},{x:31,y:174},{x:17,y:170},{x:3,y:155},{x:2,y:92},{x:55,y:36}
            ]]
        },
        {
            type: "asteroid13",
            x: -1955, y: 1656,
            ps: [[
                {x:68,y:0},{x:168,y:20},{x:251,y:77},{x:268,y:126},{x:261,y:168},{x:168,y:205},{x:124,y:203},{x:92,y:188},{x:62,y:183},{x:29,y:163},{x:5,y:67}
            ]]
        },





        //Waagrechte lange Wände
        {
            type: "ni", x: -1800, y: -1800,
            ps: [[ { x: 0, y: 0 }, { x: 900, y: 0 }, { x: 900, y: 20 }, { x: 0, y: 20 } ]],
            c: "#444"
        },
        {
            type: "ni", x: -1800, y: -1600,
            ps: [[ { x: 0, y: 0 }, { x: 900, y: 0 }, { x: 900, y: 20 }, { x: 0, y: 20 } ]],
            c: "#444"
        },
        {
            type: "ni", x: -1800, y: -1400,
            ps: [[ { x: 0, y: 0 }, { x: 900, y: 0 }, { x: 900, y: 20 }, { x: 0, y: 20 } ]],
            c: "#444"
        },
        {
            type: "ni", x: -1800, y: -1200,
            ps: [[ { x: 0, y: 0 }, { x: 900, y: 0 }, { x: 900, y: 20 }, { x: 0, y: 20 } ]],
            c: "#444"
        },

        //Sechseck-Ecke (OL)
        {
            type: "ni", x: -1800, y: -1000,
            ps: [[ { x: 0, y: 300 }, { x: 0, y: 200 }, { x: 200, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 20 }, { x: 210, y: 20 }, { x: 20, y: 210 }, { x: 20, y: 300 } ]],
            c: "#444"
        },
        //Sechseck-Ecke (OR)
        {
            type: "ni", x: -1300, y: -1000,
            ps: [[ { x: 0, y: 0 }, { x: 100, y: 0}, { x: 300, y: 200}, { x: 300, y: 300}, { x: 280, y: 300}, { x: 280, y: 210}, { x: 90, y: 20}, { x: 0, y: 20} ]],
            c: "#444"
        },
        //Sechseck-Ecke (UL)
        {
            type: "ni", x: -1800, y: -500,
            ps: [[ { x: 0, y: 0 }, { x: 0, y: 100 }, { x: 200, y: 300 }, { x: 300, y: 300 }, { x: 300, y: 280 }, { x: 210, y: 280 }, { x: 20, y: 90 }, { x: 20, y: 0 } ]],
            c: "#444"
        },
        //Sechseck-Ecke (UR)
        {
            type: "ni", x: -1300, y: -500,
            ps: [[ { x: 0, y: 300 }, { x: 100, y: 300 }, { x: 300, y: 100 }, { x: 300, y: 0 }, { x: 280, y: 0 }, { x: 280, y: 90 }, { x: 90, y: 280 }, { x: 0, y: 280 }  ]],
            c: "#444"
        },

        //gekippter Würfel
        {
            type: "ni", x: -1500, y: -700,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },

        //gekippte Würfel
        {
            type: "ni", x: -1500, y: 0,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: -1100, y: 0,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: -1900, y: 0,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        //gekippte Würfel
        {
            type: "ni", x: -1300, y: 300,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: -900, y: 300,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: -1700, y: 300,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        //gekippte Würfel
        {
            type: "ni", x: -1500, y: 600,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },
        {
            type: "ni", x: -1900, y: 600,
            ps: [[ { x: 100, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 200 }, { x: 0, y: 100 } ]],
            c: "#444"
        },

        //Sechseck-Ecke (UL)
        {
            type: "ni", x: 300, y: 500,
            ps: [[ { x: 0, y: 0 }, { x: 0, y: 100 }, { x: 200, y: 300 }, { x: 300, y: 300 }, { x: 300, y: 280 }, { x: 210, y: 280 }, { x: 20, y: 90 }, { x: 20, y: 0 } ]],
            c: "#444"
        },
        //Sechseck-Ecke (OR)
        {
            type: "ni", x: 300, y: 500,
            ps: [[ { x: 0, y: 0 }, { x: 100, y: 0}, { x: 300, y: 200}, { x: 300, y: 300}, { x: 280, y: 300}, { x: 280, y: 210}, { x: 90, y: 20}, { x: 0, y: 20} ]],
            c: "#444"
        },
        //Senkrechte lange Wände
        {
            type: "ni", x: 300, y: -500,
            ps: [[ { x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 900 }, { x: 0, y: 900 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 500, y: -700,
            ps: [[ { x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 900 }, { x: 0, y: 900 } ]],
            c: "#444"
        },
        //Sechseck-Ecke (UL)
        {
            type: "ni", x: 500, y: 300,
            ps: [[ { x: 0, y: 0 }, { x: 0, y: 100 }, { x: 200, y: 300 }, { x: 300, y: 300 }, { x: 300, y: 280 }, { x: 210, y: 280 }, { x: 20, y: 90 }, { x: 20, y: 0 } ]],
            c: "#444"
        },
        //Sechseck-Ecke (OR)
        {
            type: "ni", x: 500, y: 300,
            ps: [[ { x: 0, y: 0 }, { x: 100, y: 0}, { x: 300, y: 200}, { x: 300, y: 300}, { x: 280, y: 300}, { x: 280, y: 210}, { x: 90, y: 20}, { x: 0, y: 20} ]],
            c: "#444"
        },
        //Sechseck-Ecke (UL)
        {
            type: "ni", x: 900, y: 700,
            ps: [[ { x: 0, y: 0 }, { x: 0, y: 100 }, { x: 200, y: 300 }, { x: 300, y: 300 }, { x: 300, y: 280 }, { x: 210, y: 280 }, { x: 20, y: 90 }, { x: 20, y: 0 } ]],
            c: "#444"
        },
        //Sechseck-Ecke (OR)
        {
            type: "ni", x: 900, y: 700,
            ps: [[ { x: 0, y: 0 }, { x: 100, y: 0}, { x: 300, y: 200}, { x: 300, y: 300}, { x: 280, y: 300}, { x: 280, y: 210}, { x: 90, y: 20}, { x: 0, y: 20} ]],
            c: "#444"
        },

        //kleines Achteck
        {
            type: "ni", x: 900, y: -700,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1100, y: -700,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1300, y: -700,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1500, y: -700,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1700, y: -700,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        //kleines Achteck
        {
            type: "ni", x: 900, y: -500,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1100, y: -500,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1300, y: -500,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1500, y: -500,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1700, y: -500,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },

        //kleines Achteck
        {
            type: "ni", x: 900, y: -300,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1100, y: -300,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1300, y: -300,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1500, y: -300,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1700, y: -300,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        //kleines Achteck
        {
            type: "ni", x: 900, y: -100,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1100, y: -100,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1300, y: -100,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1500, y: -100,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1700, y: -100,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },

        //kleines Achteck
        {
            type: "ni", x: 1311, y: -1389,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1160, y: -1239,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1287, y: -1596,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1613, y: -1289,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1353, y: -1031,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },

        {
            type: "ni", x: 1931, y: -1053,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1825, y: -1586,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1800, y: -1924,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1130, y: -1879,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1465, y: -1858,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },

        {
            type: "ni", x: 1125, y: -1520,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1295, y: -1374,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1470, y: -1861,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1076, y: -1222,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1369, y: -1523,
            ps: [[ { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 30, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 30 }, { x: 0, y: 20 }, { x: 0, y: 10 } ]],
            c: "#444"
        },



        //Seitenwände

        {
            type: "ni", x: -2000, y: -2000,
            ps: [[ { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 4000 }, { x: 0, y: 4000 } ]],
            c: "#444"
        },
        {
            type: "ni", x: -2000, y: -2000,
            ps: [[ { x: 0, y: 0 }, { x: 4000, y: 0 }, { x: 4000, y: 10 }, { x: 0, y: 10 } ]],
            c: "#444"
        },
        {
            type: "ni", x: 1990, y: -2000,
            ps: [[ { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 4000 }, { x: 0, y: 4000 } ]],
            c: "#444"
        },
        {
            type: "ni", x: -2000, y: 1990,
            ps: [[ { x: 0, y: 0 }, { x: 4000, y: 0 }, { x: 4000, y: 10 }, { x: 0, y: 10 } ]],
            c: "#444"
        }


    ]

};