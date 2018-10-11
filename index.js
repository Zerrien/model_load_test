require("@babel/polyfill");
const THREE = require('three');
const $ = require("jquery");
require("./plyLoader.js");

var camera, scene, renderer;
var mesh;
var geometry;
$(function() {
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.y = 1.25;
	camera.position.z = 3;
	scene = new THREE.Scene();
	scene.add(new THREE.DirectionalLight( 0xffffff, 1 ));
	scene.add(new THREE.AmbientLight( 0xffffff, 0.5 ));
	
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var progBarText = $("#progBarText");
	var wholeProg = $("#progBarContainer");
	var progPer = $("#progBarProg");
	var progBarProgText = $("#progBarProgText");
});

window.testA = function() {
	const sTime = Date.now();
	var x = new THREE.PLYLoader()
	x.load("dragon_vrip.ply", function(geometry) {
		console.log(geometry);
		console.log("Loaded.");
		//geometry.computeVertexNormals();
		var material = new THREE.MeshStandardMaterial( { color: 0x00ff55, flatShading: true } );
		mesh = new THREE.Mesh( geometry, material );
		mesh.scale.multiplyScalar(10);
		scene.add( mesh );
		requestAnimationFrame(animate);
		console.log(Date.now() - sTime);
		window.isDone = true;
	})
}
window.testB = function() {
	const sTime = Date.now();
	fetch('./test3.ply3').then(incrementallyBuildModel(function(isDone) {
		if(isDone) {
			window.isDone = true;
			console.log(Date.now() - sTime);
		}
	}));
}

var ltime;
function animate() {
	if(!ltime) ltime = Date.now();
	let dTime = Date.now() - ltime;
	mesh.rotation.y += dTime / 3000;
	renderer.render( scene, camera );
	ltime = Date.now();
	requestAnimationFrame(animate);
}

function incrementallyBuildModel(progCallback) {
	return async function(data) {
		geometry = new THREE.BufferGeometry();
		var material = new THREE.MeshStandardMaterial( { color: 0x00ff55, flatShading: true } );
		mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.y += Math.PI / 2;
		mesh.scale.set(10, 10, 10);
		scene.add( mesh );
		requestAnimationFrame(animate);

		const genNextValue = async target => (await target.next()).value;
		const readGen = readGeneratorAsync(data.body.getReader());
		let result = await genNextValue(readGen);
		let flowBuffer = result.buffer;
		[counts, flowBuffer] = chopBufferByBytes(flowBuffer, 8);
		[vertexCount, indexCount] = new Uint32Array(counts);
		var vertices = new Float32Array(vertexCount);
		var indices = new Uint32Array(indexCount);

		let vCount = 0;
		var vertexBufferAttribute = new THREE.BufferAttribute(vertices, 3);
		vertexBufferAttribute.setDynamic(true);
		geometry.addAttribute("position", vertexBufferAttribute);

		while(vCount < vertexCount) {
			const usableBufferCount = Math.min(vertexCount - vCount, Math.floor(flowBuffer.byteLength / 4));
			[usableBuffer, flowBuffer] = chopBufferByBytes(flowBuffer, usableBufferCount * 4);
			const bufferAsFloats = new Float32Array(usableBuffer);
			for(var i = 0; i < bufferAsFloats.length; i++) {
				vertices[vCount++] = bufferAsFloats[i];
			}
			geometry.attributes.position.needsUpdate = true;
			progCallback()
			result = await genNextValue(readGen);
			if(!result) break;
			flowBuffer = _appendBuffer(flowBuffer, result.buffer);
		}
		progCallback()
		let iCount = 0;
		var indexBufferAttribute = new THREE.BufferAttribute(indices, 1);
		indexBufferAttribute.setDynamic(true);
		geometry.setIndex(indexBufferAttribute);
		while(iCount < indexCount) {
			const usableBufferCount = Math.min(indexCount - iCount, Math.floor(flowBuffer.byteLength / 4));
			[usableBuffer, flowBuffer] = chopBufferByBytes(flowBuffer, usableBufferCount * 4);
			const bufferAsUints = new Uint32Array(usableBuffer);
			for(var i = 0; i < bufferAsUints.length; i++) {
				indices[iCount++] = bufferAsUints[i];
			}
			geometry.index.needsUpdate = true;
			progCallback()
			result = await genNextValue(readGen);
			if(!result) break;
			flowBuffer = _appendBuffer(flowBuffer, result.buffer);
		}
		progCallback(true)
	}
}




function _appendBuffer(buffer1, buffer2) {
	var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
	tmp.set(new Uint8Array(buffer1), 0);
	tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
	return tmp.buffer;
}

function chopBufferByBytes(buffer, byteCount) {
	return [buffer.slice(0, byteCount), buffer.slice(byteCount, buffer.byteLength)];
}

async function* readGeneratorAsync(reader) {
	let data = await reader.read();
	while(!data.done) {
		yield data.value;
		data = await reader.read();
	}
}

