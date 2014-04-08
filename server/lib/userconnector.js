var WEBSOCKET = require('ws');
var msgpack = require('msgpack-js');

var CONNECTION = function(ws) {

    var obj = {

        member: false,
        logedin: false,
        admin: false,

        username: null,

        ws: null,

        onclose: null,

        open: false,

        lastping: 0,

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

            // Close Callback
            ws.on('close', function(code, message) {
                if (_this.onclose) {
                    _this.onclose(code, message);
                }
                _this.open = false;
                log("info", "client disconnected");
            });

            this.on("auth", function(data) {


                //todo: user über datenbank verwalten

                if(data.u == "frederic" && data.p == "master") {

                    // allowed Admin
                    _this.emit("auth", {allowed: 1});
                    _this.member = true;
                    _this.admin = true;
                    _this.logedin = true;

                    _this.username = data.u;

                } else if (data.u == "user1" && data.p == "s1") {

                    // allowed guest
                    _this.emit("auth", {allowed: 1});
                    _this.member = true;
                    _this.logedin = true;

                    _this.username = data.u;

                } else if (data.u == "user2" && data.p == "s2") {

                    // allowed guest
                    _this.emit("auth", {allowed: 1});
                    _this.member = true;
                    _this.logedin = true;

                    _this.username = data.u;

                } else if (data.u == "user3" && data.p == "s3") {

                    // allowed guest
                    _this.emit("auth", {allowed: 1});
                    _this.member = true;
                    _this.logedin = true;

                    _this.username = data.u;

                } else if (data.u == "user4" && data.p == "s4") {

                    // allowed guest
                    _this.emit("auth", {allowed: 1});
                    _this.member = true;
                    _this.logedin = true;

                    _this.username = data.u;

                } else if (data.u == "user5" && data.p == "s5") {

                    // allowed guest
                    _this.emit("auth", {allowed: 1});
                    _this.member = true;
                    _this.logedin = true;

                    _this.username = data.u;

                } else if (data.u == "guest" && data.p == "s") {

                    // allowed guest
                    _this.emit("auth", {allowed: 1});
                    _this.logedin = true;

                    _this.username = data.u;

                } else {

                    //wrong credentials
                    _this.emit("auth", {error: "wrong credentials", allowed: 0});

                }


            });

            this.on("ping", function() {
                _this.emit("pong", {});
            });

            this.ping(function(ping) {
                log("info", "client connected (ping: "+ping+")");
            });
        },

        emit: function(type, data) {
            if(this.open) {
                this.ws.send(msgpack.encode({i:type, d:data}), {binary: true});
            }
        },

        _cbs: [],
        on: function(type, callback) {
            this._cbs[type] = callback;
        },

        ping: function(callback) {
            var _this = this;

            var sendtime = process.hrtime();

            this.emit("ping", {});

            this.on("pong", function() {
                _this.lastping = process.hrtime(sendtime)[0] * 1000;

                callback(_this.lastping);
            });
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
                conn.open = true;
                connectioncallback(conn);

            });

        }

    };

    //mach den _init und gib das objekt aus
    obj._init(port, connectioncallback);
    return obj;
};
