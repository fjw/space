define(["seedrandom", "underscore"], function(SR, _) { return function() {
    var obj = {

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

        }

    };
//mach den _init und gib das objekt aus
obj._init();
return obj;
};});