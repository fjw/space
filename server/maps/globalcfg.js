exports = module.exports = {

    // ---- alle dyn. Objekte ----
    staticbouncefactor: 0.9,        // Abremsungsfaktor bei Kollision mit einem static ( in % )

    // ---- Spieler ----
    player: {
        acceleration: 500,          // Beschleunigung bei Vorwärtsflug ( px/s^2 )
        backacceleration: 300,      // Beschleunigung bei Rückwärtsflug ( px/s^2 )
        stopacceleration: 250,      // Beschleunigung bei Bremsen (zum Stoppen) ( px/s^2 )

        rotationspeed: 300,         // Rotationsgeschwindigkeit ( °/s )
        maxspeed: 300,              // max Geschwindigkeit ( px/s )

        maxenergy: 100,             // max Energie ( eu )
        energygen: 14,              // Energie Aufladung ( eu/s )

        cr: 18,                     // Kollisionsradius (px)

        explosionduration: 1,       // Zeit wie lange bei einer Explosion emittiert wird ( s )
        explosionparticles: 25,     // Anzahl emittierter Partikel

        respawntime: 10             // Zeit bis zum Respawn nach dem Tode ( s )
    },

    // ---- Projektile
    projectiles: {

        bullet: {                   // --- einfacher Schuß
            speed: 400,             // Geschwindigkeit ( px/s )
            firerate: 0.3,          // Feuerrate ( shots/s )
            cr: 8,                  // Kollisionsradius ( px )
            edrain: 15,             // Energiekosten ( eu/shot )
            dmg: 30,                // angerichteter Schaden ( eu )
            lifetime: 6             // Lebensdauer ( s )
        },

        explosion: {
            dmg: 10,
            lifetime: 1
        }

    }


};