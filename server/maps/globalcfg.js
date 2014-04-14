exports = module.exports = {

    // ---- alle dyn. Objekte ----
    staticbouncefactor: 0.9,         // Abremsungsfaktor bei Kollision mit einem static ( in % )

    // ---- Spieler ----
    player: {
        acceleration: 500,           // Beschleunigung bei Vorwärtsflug ( px/s^2 )
        backacceleration: 300,       // Beschleunigung bei Rückwärtsflug ( px/s^2 )
        stopacceleration: 250,       // Beschleunigung bei Bremsen (zum Stoppen) ( px/s^2 )

        rotationspeed: 300,          // Rotationsgeschwindigkeit ( °/s )
        maxspeed: 300,               // max Geschwindigkeit ( px/s )

        maxenergy: 100,              // max Energie ( eu )
        energygen: 14,               // Energie Aufladung ( eu/s )

        cr: 18,                      // Kollisionsradius (px)

        explosionduration: 1,        // Zeit wie lange bei einer Explosion emittiert wird ( s )
        explosionparticles: 25,      // Anzahl emittierter Partikel
        explosionfinalparticles: 4,  // Anzahl emittierter Partikel zum Schluß (gestreut)

        respawntime: 6,              // Zeit bis zum Respawn nach dem Tode ( s )

        idletime: 1800 //30min       // Zeit bis zur Selbstzerstörung bei Idle ( s )
    },

    // ---- Projektile
    projectiles: {

        bullet: {                    // --- einfacher Schuß
            speed: 400,              // Geschwindigkeit ( px/s )
            firerate: 3,             // Feuerrate ( shots/s )
            cr: 8,                   // Kollisionsradius ( px )
            edrain: 15,              // Energiekosten ( eu/shot )
            dmg: 30,                 // angerichteter Schaden ( eu )
            lifetime: 6              // Lebensdauer ( s )
        },

        bomb: {                      // --- Bombe
            speed: 100,              // Geschwindigkeit ( px/s )
            firerate: 0.5,           // Feuerrate ( shots/s )
            cr: 12,                  // Kollisionsradius ( px )
            edrain: 40,              // Energiekosten ( eu/shot )
            dmg: 40,                 // angerichteter Schaden ( eu )
            lifetime: 300,           // Lebensdauer ( s )

            explosionduration: 0.1,  // Zeit wie lange bei einer Explosion emittiert wird ( s )
            explosionparticles: 35   // Anzahl emittierter Partikel, wenn gesetzt explodiert der Particel an einer Wand
        },

        bombexplosion: {             // --- Explosionsfragment einer Bombe
            dmg: 10,
            lifetime: 0.6,

            speedmin: 30,           // min Geschwindigkeit eines Fragments ( px/s )
            speedmax: 80            // max Geschwindigkeit eines Fragments ( px/s )
        },

        explosion: {                 // --- Explosionsfragment
            dmg: 10,
            lifetime: 1,

            speedmin: 200,           // min Geschwindigkeit eines Fragments ( px/s ) ( bezieht sich auf die gestreuten Fragmente am Ende der Explosion)
            speedmax: 400            // max Geschwindigkeit eines Fragments ( px/s )
        }

    }


};