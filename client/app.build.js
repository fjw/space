({
    appDir: "src",
    baseUrl: "scripts",
    dir: "build",
    modules: [
        {
            name: "main"
        },
        {
            name: "adminmain"
        }
    ],
	paths: {
        'jquery':       'lib/jquery',
        'underscore':   'lib/underscore',
        'socketio':     'lib/socketio',
        'seedrandom':   'lib/seedrandom'
    }
})
