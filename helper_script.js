const fs = require('fs');

var fileAsString = fs.readFileSync('./dragon_vrip.ply2', {encoding: 'utf-8'});
var file2AsString = fs.readFileSync('./biggun.txt', {encoding: 'utf-8'});

fileAsString = fileAsString.replace(/\s+/g, " ");
fileAsArray = fileAsString.split(" ");
const vertCount = fileAsArray.shift() * 3;
fileAsArray.pop();
const verts = fileAsArray.slice(0, vertCount).map(elem => parseFloat(elem))
let indices = fileAsArray.slice(vertCount, fileAsArray.length).filter((elem, index) => index & 3).map(elem => parseInt(elem, 10));
const indexCount = indices.length;

const test = new Float32Array(verts); //0.0317083 // 0.03170830011367798

console.log("i", indices.length);
var indices2 = [];
for(var i = 0; i < indices.length; i += 3) {
	indices2.push([indices[i], indices[i + 1], indices[i + 2]]);
}

console.log("i2", indices2.length);
//shuffle(indices2);
console.log(indices2[0])
indices = indices2.reduce((acc, elem) => {acc.push(...elem); return acc;}, []);
console.log(indices[0])
console.log(indices[1])
console.log(indices[2])
console.log("i", indices.length);
const test2 = new Uint32Array(indices);
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

console.log(test.length, test2.length);
var max = indices.reduce((acc, elem) => Math.max(acc, elem), -Infinity);
console.log(max);

//console.log(Buffer.from(test));
/*
const buff = Buffer.alloc(vertCount.toString().length + indexCount.toString().length);
buff.write(vertCount.toString());
buff.write(indexCount.toString());
console.log(buff);
*/
var stream = fs.createWriteStream('test4.ply3', {encoding: 'binary'});

stream.write(Buffer.from(new Int8Array(new Int32Array([vertCount]).buffer)));
stream.write(Buffer.from(new Int8Array(new Int32Array([indexCount]).buffer)));
stream.write(Buffer.from(new Int8Array(test.buffer)));
stream.write(Buffer.from(new Int8Array(test2.buffer)));
/*
stream.write(vertCount.toString());
stream.write(Buffer.from([0x00]));
stream.write(indexCount.toString());
stream.write(Buffer.from([0x00]));
*/
stream.end();
/*
const result = [vertCount, indexCount, ...verts, ...indices];

const buffer = Buffer.from(result);
console.log(result[0]);
console.log(buffer);
*/