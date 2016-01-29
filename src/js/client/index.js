const dataWidth = Math.pow(2,1);
const canvas = document.getElementById("webgl");
canvas.width = dataWidth;
canvas.height = dataWidth;
const tmpCanvas = document.getElementById('tmp');
// const tmpContext = tmpCanvas.getContext('2d');
const gl = canvas.getContext('webgl');

const magicString = 'zayr';
const magicArray = Array.prototype.map.call(magicString, c => c.charCodeAt(0));
console.log(magicArray);

let averages = [];
const timeStart = new Date();

const cpuTime = (new Date()).getTime() - timeStart.getTime();

let vertexBuffer;
let vPosition;
let uSampler;
let texture;
let uMagicArray;
let uN;

gl.clearColor(0,0,0,1);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.viewport(0,0,dataWidth,dataWidth);

const srcImg = document.getElementById("src");
const outputImg = document.getElementById("output");
const thresholdInput = document.querySelector('input');

document.querySelector('button').addEventListener('click', () =>{
initShaders();
initBuffers();
// initTextures();
draw();
})

// const n = 32452867*32452867;
// const n = 6;
const n = 10262321;
// const n = 912389*91237;
console.log("N", n);
let divisor;
console.time('CPU');
for(let i = 2; i < Math.pow(n, 0.5); i++){
	if(n%i == 0){
		divisor = i;
		console.log(divisor);
	}
}
if(!divisor) console.log('PRIME');
console.timeEnd('CPU');

function draw(){
let pixels = new Uint8Array(dataWidth * dataWidth * 4);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

	// gl.activeTexture(gl.TEXTURE0);
	// gl.bindTexture(gl.TEXTURE_2D, texture);
	// gl.uniform1i(uSampler, 0);
	// gl.uniform4iv(uMagicArray, magicArray);
	gl.uniform1i(uN, n);

	console.time('GPU');
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	// if(!outputImg.src){
		gl.flush();
gl.readPixels( 0, 0, dataWidth, dataWidth, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		// console.log(pixels.slice(0,4));
		let outputData = new Uint8Array(pixels.length);
		let i = dataWidth;
		do{
			// console.log(pixels.slice(i*dataWidth, i*dataWidth+256));
			outputData.set(pixels.slice(4*(i-1)*dataWidth, 4*(i*dataWidth)), (dataWidth-i)*dataWidth);
		}while(i--);
		console.log(outputData.slice(0,16));
		for(let i = 0; i < outputData.length; i+=4){
			let quad = outputData.slice(i, i+4);
			if(quad[0] > 0 || quad[1] > 0 || quad[2] > 0 || quad[3] > 0){
				let factor = i/4*1024 + quad[3]+quad[2]+quad[1]+quad[0];
				console.log("FOUND", i/4, quad, factor, n/factor);
			}
		}
		console.timeEnd('GPU');
		// }
		// const offset = outputData.length-256-testPointOffset
		// const outputOffset = 4*(((dataWidth-1)-testPoint[1])*dataWidth+testPoint[0]);

// debug.innerHTML = debug.innerHTML + 'avg gpu' + outputData[outputOffset] + '<br/>';
// debug.innerHTML = debug.innerHTML + 'r out' + outputData[outputOffset+1] + '<br/>';
// debug.innerHTML = debug.innerHTML + 'gpu time' + gpuTime + '<br/>';
	// 	return;


	// }

	// requestAnimationFrame(draw);
}

function initTextures(){
	texture = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_2D, texture);
	// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	// gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);

	draw();

}

function initBuffers(){
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	const vertices = [
		1, 1, 0,
		-1, 1, 0,
		1, -1, 0,
		-1, -1, 0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

}

function initShaders(){
	const fragmentShader = getFragmentShader();
	const vertexShader = getVertexShader();

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.error("Unable to initialize the shader program.");
	}else{
		console.log("Initialized shader program");
	}

	gl.useProgram(shaderProgram);

	vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
	gl.enableVertexAttribArray(vPosition);

	// uMagicArray = gl.getUniformLocation(shaderProgram, "uMagicArray");

	uSampler = gl.getUniformLocation(shaderProgram, "uSampler");
	uN = gl.getUniformLocation(shaderProgram, "uN");

}

function getFragmentShader(){
	const shader = gl.createShader(gl.FRAGMENT_SHADER);
	const source = `
		precision highp float;
		// uniform ivec4 uMagicArray;
		varying vec2 vCoord;
		uniform int uN;

		void main(void) {

			gl_FragColor = vec4(0.0,0.0,0.0,0.0);
			// float offset = vCoord.x*${dataWidth}.0 + vCoord.y*${dataWidth}.0*${dataWidth}.0;
			int offset = int(int(vCoord.x*${dataWidth}.0) + int(vCoord.y*${dataWidth}.0)*${dataWidth})*1024;
			for(int i = 0; i < 1023; i++){
				int rem = int(mod(float(uN), float(offset+i)));
				if(offset+i > 1 && offset + i < uN && rem == 0){
					// gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
					gl_FragColor = vec4(float(i-255*3)/255.0, float(i-255*2)/255.0, float(i-255*1)/255.0, float(i-255*0)/255.0);
				}
			}

			// int offset = int(int(vCoord.x*${dataWidth}.0) + int(vCoord.y*${dataWidth}.0)*${dataWidth})*1024;
			// int i = 2;
			// float f = float(offset+i);
			// int rem = int(mod(float(uN), f));
			// if(int(f) < uN && rem == 0){
			// 	gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
			// }
			// if(int(f) >= uN){
			// 	gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
			// }
			// if(int(vCoord.x*${dataWidth}.0) == 2 && int(vCoord.y*500.0) == 0){
			// 	gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
			// }
			// if(vCoord.y/256.0*256.0 == 1.0/256.0*256.0){
			// 	gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
			// }

			// gl_FragColor = vec4(vCoord.x, vCoord.y, 0.0, 1.0);


			// const int iterations = 256*256;//int(pow(float(256),float(4)));
			// for(int i = 0; i < iterations; i++){
				// foo();
				// gl_FragColor = vec4(1.0,0.0,0.0,1.0);
			// }
			// vec4 fvec = vec4(uMagicArray);
			// for(int i = 0; i < iterations; i++){
			// 	int iMod256 = int(mod(float(i), 256.0));
			// 	if(
			// 		int(vCoord.x*${dataWidth}.0) == uMagicArray.x &&
			// 		int(vCoord.y*${dataWidth}.0) == uMagicArray.y &&
			// 		iMod256  == uMagicArray.z &&
			// 		(i - iMod256)/256 == uMagicArray.w
			// 	){
			// 		gl_FragColor = vec4(1.0,0.0,0.0,1.0);
			// 	}else{
			// 		gl_FragColor = vec4(0.0,0.0,0.0,1.0);
			// 	}
			// }
		}
	`;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
		return null;
	}else{
		console.log("Fragment shader compiled");
	}
	return shader;
}

function getVertexShader(){
	const shader = gl.createShader(gl.VERTEX_SHADER);
	const source = `
		precision highp float;
		attribute vec3 vPosition;
		varying vec2 vCoord;
		void main(void) {
			vCoord = vec2((vPosition.s+1.0)/2.0, 1.0-(vPosition.t+1.0)/2.0);
			gl_Position = vec4(vPosition, 1.0);
			// gl_Position = vec4(vPosition, 1.0);
		}
	`;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
		return null;
	}else{
		console.log("Vertex shader compiled");
	}

	return shader;
}
