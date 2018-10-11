const puppeteer = require("puppeteer");
const Canvas = require('canvas-prebuilt');

var cWidth = 1200;
var cHeight = 600;
var canvas = new Canvas(cWidth, cHeight);
var ctx = canvas.getContext('2d');

var fs = require('fs');
var out = fs.createWriteStream(__dirname + '/text2.png')
var out2 = fs.createWriteStream(__dirname + '/text3.png')
var outArray = [out, out2];


;(async function() {
	//await doThing("testB");
	await doThing("testA");
	/*
	for(var i = 0; i < 10; i++) {
		await doThing("testB");
	}
	
	for(var i = 0; i < 10; i++) {
		await doThing("testA");
	}
	*/
	
	const safeMax = (a, b) => Math.max(a, b);
	const safeMin = (a, b) => Math.min(a, b);
	const flat = (acc, elem) => acc.concat(elem);
	const returnJSHeapUsedSize = elem => elem.JSHeapUsedSize;
	var min = anArray.reduce(flat, []).map(returnJSHeapUsedSize).reduce(safeMin, Infinity);
	var max = anArray.reduce(flat, []).map(returnJSHeapUsedSize).reduce(safeMax, -Infinity);
	var diff = max - min;
	var mDiff = anArray2.reduce(safeMax, -Infinity);
	for(var lmnop = 0; lmnop < 2; lmnop++) {
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, cWidth, cHeight);
		ctx.fillStyle = "black";
		ctx.save();
		ctx.font="14px Arial";
		ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
		for(var i = 0; i < 11; i++) {
			ctx.beginPath();
			ctx.moveTo((i / 10) * cWidth, 0);
			ctx.lineTo((i / 10) * cWidth, cHeight);
			ctx.save();
			ctx.translate((i / 10) * cWidth, 0);
			ctx.rotate(Math.PI / 2);
			if(i === 10) {
				ctx.textBaseline = "top";
			}
			ctx.fillText((mDiff / 10 * i).toFixed(4) + "ms", 0, 0);
			ctx.restore();
			ctx.moveTo(0, (i / 10) * cHeight);
			ctx.lineTo(cWidth, (i / 10) * cHeight);
			ctx.save();
			ctx.translate(14, (i / 10) * cHeight);
			if(i === 0) {
				ctx.textBaseline = "top";
			}
			ctx.fillText(Math.round((min + (diff / 10 * (10-i))) / 1024 / 1024) + "MB Heap", 0, 0);
			ctx.restore();
			ctx.stroke();
		}
		ctx.restore();

		//console.log(mDiff);
		//for(var i = 0; i < anArray3.length; i++) {
			let td = anArray2[lmnop];
			let r = td / mDiff;
			for(var j = 0; j < cWidth * r; j++) {
				const testIndex = Math.floor(anArray3[lmnop].length * (j / (cWidth * r)));
				const testTest = anArray3[lmnop][testIndex]
				const potentialJ = Math.floor((j / cWidth) * r * cWidth);
				if(testTest) {
					ctx.fillStyle = "rgba(0, 255, 0, 0.125)"
				} else {
					ctx.fillStyle = "rgba(255, 0, 0, 0.125)"
				}
				ctx.fillRect(j, 0, 1, cHeight);
			}
		//}
		//for(var j = 0; j < anArray.length; j++) {
			if(lmnop < 1) {
				ctx.strokeStyle = "blue";
			} else {
				ctx.strokeStyle = "red";
			}
			td = anArray2[lmnop];
			r = td / mDiff;
			var tArray = anArray[lmnop];
			ctx.beginPath();
			ctx.moveTo(0, (1 - ((tArray[0].JSHeapUsedSize - min) / diff)) * cHeight);
			for(var i = 1; i < tArray.length; i++) {
				ctx.lineTo((i / tArray.length) * cWidth * r, (1 - ((tArray[i].JSHeapUsedSize - min) / diff)) * cHeight);
			}
			ctx.stroke();
		//}
		
		var stream = canvas.pngStream();
		stream.on('data', function(chunk){
		  outArray[lmnop].write(chunk);
		});
		await new Promise((res, rej) => {
			stream.on('end', function(){
				console.log("done?");
				res();
			});
		})
	}
})();

var anArray = [];
var anArray2 = [];
var anArray3 = [];
async function doThing(testName) {
	const browser = await puppeteer.launch({headless: false});
	var tArray = [];
	var bArray = [];
	const page = await browser.newPage();
	
	const client = await page.target().createCDPSession()
	/*
	await client.send('Network.emulateNetworkConditions', { // 'Regular4G'
    'offline': false,
    'downloadThroughput': 4 * 1024 * 1024 / 8,
    'uploadThroughput': 3 * 1024 * 1024 / 8,
    'latency': 20
  })
  */
	var sTime = process.hrtime();
	sTime = sTime[0] * 1000 + sTime[1] / 1000000;
	var a_very_unique_result = true;
	var a = setInterval(async function() {
		tArray.push(await page.metrics());
	});
	var isDoneDone = false;
	;(function funcTest() {
		setTimeout(async function() {
			await new Promise(async function(res, rej) {
				a_very_unique_result = true;
				var timeout = setTimeout(function() {
					rej();
				}, 10);
				await page.waitForFunction('window').catch(e => null);
				clearTimeout(timeout);
				res();
			}).catch((e) => {
				a_very_unique_result = false;
				//console.log(e, "10ms timeout!")
			});
			bArray.push(a_very_unique_result);
			if(!isDoneDone) {
				funcTest();
			}
		})
	})();
	await page.tracing.start({path: 'trace.json'});
	await page.goto("http://localhost:8080");
	await page.waitForFunction('window.' + testName, {
		timeout: 30000 * 2 * 3
	});
	await page.evaluate('window.'+testName+"()");
	await page.waitForFunction('window.isDone', {
		timeout: 30000 * 2 * 3
	});
	await page.tracing.stop();
	await page.screenshot({path: './example.png'});
	//await new Promise((res, rej) => setTimeout(res, 5000));
	isDoneDone = true;
	clearInterval(a);
	var kTime = process.hrtime();
	kTime = kTime[0] * 1000 + kTime[1] / 1000000;
	await browser.close();
	anArray.push(tArray);
	anArray2.push(kTime - sTime);
	anArray3.push(bArray);
}