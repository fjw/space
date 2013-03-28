exports = module.exports = function(type, txt) {

	var a = " * "+type+"  - ";

	switch (type) {
		case "critical":
			console.log(a.red.underline + txt);
			process.exit(1);
			break;
		case "error":
			console.log(a.red + txt);
			break;
		case "info":
			console.log(a.blue + txt);
			break;
        case "benchmark":
            console.log(a.green + txt);
            break;
		case "warn":
			console.log(a.yellow + txt);
			break;
		default:
			console.log(a + txt);
			break;
	}

};