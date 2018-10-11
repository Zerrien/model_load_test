const {gzip, ungzip} = require('node-gzip');
const fs = require('fs');

var sTime = Date.now();
var file = fs.readFileSync('./test3.ply3')
var r = gzip(file).then(compressed => {
	fs.writeFileSync("./test3.gz", compressed);
	console.log(Date.now() - sTime);
});
