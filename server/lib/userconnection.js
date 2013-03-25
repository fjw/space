var WEBSOCKET = require('ws');
var msgpack = require('msgpack-js');

var CONNECTION = function(ws) {

    var obj = {

        member: false,
        logedin: false,
        admin: false,

        ws: null,

        _init: function(ws) {
            var _this = this;

            this.ws = ws;

            // Decode und Leite Nachricht an Handler weiter
            ws.on('message', function(message, flags) {
                if(flags.binary) {
                    var m = msgpack.decode(message);
                    if (_this._cbs[m.i]) {
                        _this._cbs[m.i](m.d);
                    }
                }
            });

            this.on("auth", function(data) {


                //todo: user über datenbank verwalten

                if(data.u == "frederic" && data.p == "master") {

                    // allowed Admin
                    _this.send("auth", {allowed: 1});
                    _this.member = true;
                    _this.admin = true;
                    _this.logedin = true;

                } else if (data.u == "user" && data.p == "s") {

                    // allowed guest
                    _this.send("auth", {allowed: 1});
                    _this.member = true;
                    _this.logedin = true;

                } else if (data.u == "guest" && data.p == "s") {

                    // allowed guest
                    _this.send("auth", {allowed: 1});
                    _this.logedin = true;

                } else {

                    //wrong credentials
                    _this.send("auth", {error: "wrong credentials", allowed: 0});

                }


            });

            log("info", "a client connected");
        },

        send: function(type, data) {
            this.ws.send(msgpack.encode({i:type, d:data}), {binary: true});
        },

        _cbs: [],
        on: function(type, callback) {
            this._cbs[type] = callback;
        }

    };

    obj._init(ws);
    return obj;
};

exports = module.exports = function(port, connectioncallback) {
    var obj = {

        sock: null,


        _init: function(port, connectioncallback) {

            this.sock = new WEBSOCKET.Server({port: port});

            this.sock.on('connection', function(ws) {

                var conn = new CONNECTION(ws);
                connectioncallback(conn);

            });

        }

    };

    //mach den _init und gib das objekt aus
    obj._init(port, connectioncallback);
    return obj;
};
