define(["socketio", "underscore"], function(sio, _) { return function() {
var obj = {

	sock: null,
    namespace: "/master",
    hostname: "t.toolset.io:443",
    preOns: [],

    _init: function() {

    },

    connect: function(user, password, callback) {
        var _this = this;

        var qs = "?user="+user+"&password="+password;

        var options = {
            'force new connection': true
        };

        if (document.location.href == "http://localhost:4004/") {
            //DEV MODE
            this.hostname = document.location.href;
        }

        if (window.debug) {
            console.info("create socket to %s, namespace: %s", this.hostname, this.namespace);
        }
        this.sock = io.connect(this.hostname + qs, options).socket.of(this.namespace);

        //register preons
        _.each(this.preOns, function(preon) {
            _this.on(preon.msg, preon.callback);
        });
        //this.preOns = null;


        this.sock.on("connect", function() {
            callback();
        });

        this.sock.on('connect_failed', function (reason) {
            console.error('unable to connect', reason);
            _this.sock.disconnect();
        });

    },

    emit: function(msg, data) {
        if(this.sock) {
            if (window.debug) {
                console.info("sending '"+msg+"'");
                console.log(data);
            }

            this.sock.emit(msg, data);
        } else {
            console.log("can't emit, no connection");
        }
    },

    on: function(msg, callback) {

        if(this.sock) {

            this.sock.on(msg, function(resp) {
                if (window.debug) {
                    console.info("received '"+msg+"'");
                    console.log(resp);
                }

                callback(resp);

            });

        } else {

            this.preOns.push({msg: msg, callback: callback});

        }

    }


};

//mach den _init und gib das objekt aus
obj._init();
return obj;

};});