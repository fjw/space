/*!
    fTools
    Copyright: Frederic Worm
 */
;(function(window) {

    /* Detect free variable `exports` */
    var freeExports = typeof exports == 'object' && exports;
    /* Detect free variable `module` */
    var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;
    /* Detect free variable `global` and use it as `window` */
    var freeGlobal = typeof global == 'object' && global;
    if (freeGlobal.global === freeGlobal) {
        window = freeGlobal;
    }


    var ft = {

        maxcachecount:1000,
        _cache: [],

        _init: function() {

        },

        getRandomNumber: function(min, max) {
            return Math.round(min + (Math.random()*(max-min)));
        },

        getRandomNumberPack: function(seed, count, min, max) {

            var key = "grn" + seed + count + min + max;
            var cc = this.getFromCache(key);

            if(cc) {

                return cc;

            } else {

                Math.seedrandom(seed);
                var nums = [];
                for(var i = 0; i < count; i++) {
                    nums.push(this.getRandomNumber(min, max));
                }

                this.cacheIt(key, nums);

                return nums;
            }
        },

        cacheIt: function(key, value) {

            var count = this._cache.unshift({
                k: key,
                v: value
            });

            if (count > this.maxcachecount) {
                this._cache.pop();
            }
        },

        getFromCache: function(key) {

            var it = _.find(this._cache, function(item) { return item.k == key; });
            return it ? it.v : null;

        },

        round: function(num) {
            //fast Round-implementation

            return num;
            //return Math.round(num);
            //return (num+0.5)|0;
        },

        each: function(collection, callback) {
            //Powerschleife
            if (collection) {
                var fn = callback,
                    index = -1,
                    length = collection.length;

                while (++index < length) {
                    if (fn(collection[index], index, collection) === false) {
                        break;
                    }
                }
                return collection;
            }
        },

        isBoxOverlap: function(x1, y1, w1, h1, x2, y2, w2, h2) {

            return (x1 <= x2+w2 &&
                    x2 <= x1+w1 &&
                    y1 <= y2+h2 &&
                    y2 <= y1+h1);
        }


    };

    //mach den _init
    ft._init();


    /*--------------------------------------------------------------------------*/

    // expose

    // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        window.ft = ft;
        define(function() {
            return ft;
        });
    } else if (freeExports) {
        // in Node.js or RingoJS v0.8.0+
        if (freeModule) {
            (freeModule.exports = ft).ft = ft;
        }
        // in Narwhal or RingoJS v0.7.0-
        else {
            freeExports.ft = ft;
        }
    }
    else {
        // in a browser or Rhino
        window.ft = ft;
    }


}(this));

