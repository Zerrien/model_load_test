const {gzip, ungzip} = require('node-gzip');
const fs = require('fs');

var sTime = Date.now();
var file = fs.readFileSync('./dragon_vrip.ply', 'utf-8')
var r = gzip(file).then(compressed => {
	fs.writeFileSync("./dragon_vrip.gz", compressed);
	console.log(Date.now() - sTime);
});
