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
        'lodash':       'lib/lodash',
        'socketio':     'lib/socketio',
        'seedrandom':   'lib/seedrandom',
        'ftools':       'lib/ftools'
    }
})
