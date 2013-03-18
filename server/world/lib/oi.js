exports = module.exports = function (foo) {
	console.log(require('util').inspect(foo, true, null));
};