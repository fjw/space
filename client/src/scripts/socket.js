define(["msgpack", "lodash"], function(msgpack, _) { return function() {
var obj = {

	sock: null,

    hostname: "ws://"+document.location.hostname+":4004",
    username: false,

    lastping: 0,

    _init: function() {

        if(window.env && window.env == "production") {
            this.hostname = "ws://"+document.location.hostname+":443";
        }

    },

    connect: function(callback) {
        var _this = this;


        if (window.debug) {
            console.info("create socket to %s", this.hostname);
        }

        this.sock = new WebSocket(this.hostname);
        this.sock.binaryType = 'arraybuffer';

        this.sock.onmessage = function(message) {

            if(message.data) {
                var msg = msgpack.decode(message.data);
                if (msg && msg.i && _this._cbs[msg.i]) {
                    if (window.debug) {
                        if ( (msg.i != "wu" && msg.i != "pi" && msg.i != "po") || window.debug >= 3) {
                            console.info("received '"+msg.i+"'");
                            console.log(msg.d);
                        }
                    }
                    _this._cbs[msg.i](msg.d);

                }
            }
        };

        //todo: auto reconnect
        this.sock.onclose = function() {

            if(window.errorMsg) {
                window.errorMsg("connection lost");
            } else {
                console.error("connection lost");
            }

            _this.sock = null;
        };

        this.sock.onopen = function() {

            if(callback) {
                callback();
            }

        };

    },

    auth: function(username, password, callback) {
        var _this = this;

        this.emit("auth", {u:username, p:password});

        this.on("auth", function(data) {

            if (!data.error && data.allowed) {
                _this.username = username;
                callback(false);
            } else {
                _this.username = null;
                callback(data.error);
            }

        });

    },

    ping: function(callback) {
        //todo: ping reparieren?
    },

    emit: function(msg, data) {
        if(this.sock) {
            if (window.debug) {
                if ( (msg != "wu" && msg != "pi" && msg != "po") || window.debug >= 3) {
                    console.info("sending '"+msg+"'");
                    console.log(data);
                }
            }

            this.sock.send(msgpack.encode({ i:msg, d:data }));
        } else {
            console.error("can't emit, no connection");
        }
    },

    _cbs: {},
    on: function(msg, callback) {
        this._cbs[msg] = callback;
    }


};

//mach den _init und gib das objekt aus
obj._init();
return obj;

};});