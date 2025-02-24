// =====================================================
var gl;

// =====================================================
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var rotMatrix = mat4.create();
var boxRotMatrix = mat4.create();
var distCENTER;
// =====================================================
var OBJ1 = null;
var PLANE = null;
var SKYBOX = null;
// =====================================================
var choice = 4;						//Choix de BRDF
// =====================================================
var xLightPos = 0.0;				//Position x de la lumière			
var yLightPos = 0.0;				//Position y de la lumière	
// =====================================================
var index = 1.00027;					//Indice de réfraction simple (par defaut : Vide)
var rgbIndex = [0.56,0.57,0.58];	//Indice de réfraction complexe (par defaut : Fer)

var texture_name = "church";

// =====================================================
// OBJET 3D, lecture fichier obj
// =====================================================

class objmesh {

	// --------------------------------------------
	constructor(objFname) {
		this.objName = objFname;
		this.shaderName = 'obj';
		this.loaded = -1;
		this.shader = null;
		this.mesh = null;
		
		loadObjFile(this);
		loadShaders(this);
		this.initTextures();
	}

	// --------------------------------------------

	initTextures(){
		var faces = ["textures/"+ texture_name +"/px.png",
					 "textures/"+ texture_name +"/nx.png",	
				   	 "textures/"+ texture_name +"/py.png",
				 	 "textures/"+ texture_name +"/ny.png",
					 "textures/"+ texture_name +"/pz.png",
					 "textures/"+ texture_name +"/nz.png"];

		var texture = gl.createTexture();		 
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

		var images = [new Image(),new Image(),new Image(),new Image(),new Image(),new Image()]

		for(let i=0; i< 6 ;i++){
			
			images[i].src = faces[i];
			images[i].onload = function () {
				gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X +i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,images[i]);
			}
		}

		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.activeTexture(gl.TEXTURE0);


	}

	// --------------------------------------------
	setShadersParams() {


		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.nAttrib = gl.getAttribLocation(this.shader, "aVertexNormal");
		gl.enableVertexAttribArray(this.shader.nAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.normalBuffer);
		gl.vertexAttribPointer(this.shader.nAttrib, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.rMatrixUniform = gl.getUniformLocation(this.shader, "uRMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");

		this.shader.lightPos = gl.getUniformLocation(this.shader, "uLightPos");
		this.shader.lightPower = gl.getUniformLocation(this.shader, "uLightPower");
		this.shader.lightColor = gl.getUniformLocation(this.shader, "uLightColor");
		this.shader.color = gl.getUniformLocation(this.shader, "uColor");
		this.shader.shineCoeff = gl.getUniformLocation(this.shader, "uShineCoeff");

		this.shader.kD = gl.getUniformLocation(this.shader, "uKd");
		this.shader.kS = gl.getUniformLocation(this.shader, "uKs");
		this.shader.rugosity = gl.getUniformLocation(this.shader, "uRugosity");

		this.shader.refractiveIndex = gl.getUniformLocation(this.shader, "uRefractiveIndex");
		this.shader.rgbRefractiveIndex = gl.getUniformLocation(this.shader, "uRGBRefractiveIndex");
		this.shader.nbEchantillonnage = gl.getUniformLocation(this.shader, "uNbEchantillonnage");
		this.shader.time = gl.getUniformLocation(this.shader, "u_Time");

		this.shader.reflAmount = gl.getUniformLocation(this.shader, "uReflectionAmount");		
		this.shader.refrAmount = gl.getUniformLocation(this.shader, "uRefractionAmount");

		this.shader.choice = gl.getUniformLocation(this.shader, "uChoice");

		this.shader.skybox = gl.getUniformLocation(this.shader, "skybox"); 


	}
	
	// --------------------------------------------
	setUniformsParams() {

		var zLightPos = document.getElementById("zPos").value;
		var lightPower = document.getElementById("power").value;
		var nbRayEchantillonnage = document.getElementById("nbRayEchant").value;
		var lightColor = convertHexLight(document.getElementById("LightColor").value);
		var color = convertHex(document.getElementById("color").value);	

		var kD = document.getElementById("kD").value;
		var kS = Math.round((1.0 - kD) * 100) / 100; 						//Ks arrondi à 2 décimales
		document.getElementById("kS").innerText = kS;
		var rugosity = document.getElementById("rugosity").value;
		var shineCoeff = document.getElementById("shineCoeff").value;

		var reflAmount = document.getElementById("reflRefr").value;
		var refrAmount = Math.round((1.0 - reflAmount) * 100) / 100; 	;
		document.getElementById("reflection").innerText = reflAmount;
		document.getElementById("refraction").innerText = refrAmount;

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);	
		
		gl.uniformMatrix4fv(this.shader.rMatrixUniform, false, rotMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);

						
		gl.uniform3fv(this.shader.lightPos,[xLightPos,yLightPos,zLightPos]);
		gl.uniform3fv(this.shader.lightPower,[lightPower,lightPower,lightPower]);
		gl.uniform3fv(this.shader.lightColor,lightColor);
		gl.uniform3fv(this.shader.color,color);
		gl.uniform1f(this.shader.shineCoeff,shineCoeff);

		gl.uniform1f(this.shader.kD,kD);
		gl.uniform1f(this.shader.kS,kS);
		gl.uniform1f(this.shader.rugosity,rugosity);

		gl.uniform1f(this.shader.refractiveIndex,index);
		gl.uniform3fv(this.shader.rgbRefractiveIndex,rgbIndex);
		gl.uniform1f(this.shader.nbEchantillonnage,nbRayEchantillonnage);
	
		var d = new Date();
		var time = d.getTime();
		gl.uniform1f(this.shader.time,time);

		gl.uniform1f(this.shader.reflAmount,reflAmount);
		gl.uniform1f(this.shader.refrAmount,refrAmount);


		gl.uniform1i(this.shader.choice,choice);

		gl.uniform1i(this.shader.skybox, 0); 


	}
	
	// --------------------------------------------
	draw() {
		if(this.shader && this.loaded==4 && this.mesh != null) {
			this.setShadersParams();
			this.setUniformsParams();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
			gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}

}



// =====================================================
// PLAN 3D, Support géométrique
// =====================================================

class plane {
	
	// --------------------------------------------
	constructor() {
		this.shaderName='plane';
		this.loaded=-1;
		this.shader=null;
		this.initAll();
	}
		
	// --------------------------------------------
	initAll() {
		var size=1.0;
		var vertices = [
			-size, -size, 0.0,
			 size, -size, 0.0,
			 size, size, 0.0,
			-size, size, 0.0
		];

		var texcoords = [
			0.0,0.0,
			0.0,1.0,
			1.0,1.0,
			1.0,0.0
		];

		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vBuffer.itemSize = 3;
		this.vBuffer.numItems = 4;

		this.tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
		this.tBuffer.itemSize = 2;
		this.tBuffer.numItems = 4;

		loadShaders(this);
	}
	
	
	// --------------------------------------------
	setShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
		gl.enableVertexAttribArray(this.shader.tAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");

	}


	// --------------------------------------------
	setMatrixUniforms() {
			mat4.identity(mvMatrix);
			mat4.translate(mvMatrix, distCENTER);
			mat4.multiply(mvMatrix, rotMatrix);
			gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
			gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);	

	}

	// --------------------------------------------
	draw() {
		if(this.shader && this.loaded==4) {		
			this.setShadersParams();
			this.setMatrixUniforms(this);
		
			gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
			gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
		}
	}

}


// =====================================================
// SKYBOX  
// =====================================================


class skybox{
	constructor() {
		this.shaderName='skybox';
		this.loaded=-1;
		this.shader=null;
		this.initAll();
		this.initTextures();

	}


	initAll() {

		var size = 10.0;
		var vertices = [
			-size,-size,size,			//Top
			-size,size,size,
			size,size,size,
			size,-size,size,

			-size,-size,size,			//Left
			-size,-size,-size,
			-size,size,-size,
			-size,size,size,

			-size,-size,-size,			//Bottom
			size,-size,-size,
			size,size,-size,
			-size,size,-size,

			size,-size,size,			//Right
			size,size,size,
			size,size,-size,
			size,-size,-size,

			-size,size,-size,			//Front
			size,size,-size,
			size,size,size,
			-size,size,size,

			-size,-size,-size,			//Back
			-size,-size,size,
			size,-size,size,
			size,-size,-size

		];

		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vBuffer.itemSize = 3;
		this.vBuffer.numItems = 24;

		var texcoords = [ 
			1.0, 1.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,
			1.0, 1.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,
			0.0, 1.0,  0.0, 0.0,  1.0, 0.0,  1.0, 1.0,
		    1.0, 0.0,  1.0, 1.0,  0.0, 1.0,  0.0, 0.0,  
			0.0, 1.0,  0.0, 0.0,  1.0, 0.0,  1.0, 1.0,
			0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0
		];	

		this.tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
		this.tBuffer.itemSize = 2;
		this.tBuffer.numItems = 24;


		// Index buffer (array)
		var indices = [ 
			0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11,
			12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
		];
		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		this.indexBuffer.itemSize = 1;
		this.indexBuffer.numItems = indices.length;


		loadShaders(this);
	}

	initTextures(){
		var faces = ["textures/"+ texture_name +"/px.png",
					 "textures/"+ texture_name +"/nx.png",	
				   	 "textures/"+ texture_name +"/py.png",
				 	 "textures/"+ texture_name +"/ny.png",
					 "textures/"+ texture_name +"/pz.png",
					 "textures/"+ texture_name +"/nz.png"];

		var texture = gl.createTexture();		 
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

		var images = [new Image(),new Image(),new Image(),new Image(),new Image(),new Image()]

		for(let i=0; i< 6 ;i++){
			
			images[i].src = faces[i];
			images[i].onload = function () {
				gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X +i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,images[i]);
			}
		}

		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.activeTexture(gl.TEXTURE0);


	}
	
	
	// --------------------------------------------
	setShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
		gl.enableVertexAttribArray(this.shader.tAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
		this.shader.skybox = gl.getUniformLocation(this.shader, "skybox"); 

	}

	// --------------------------------------------
	setUniforms(){
		gl.uniform1i(this.shader.skybox, 0); 
	}

	// --------------------------------------------
	setMatrixUniforms() {
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);
		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);

	}

	// --------------------------------------------
	draw() {
		if(this.shader && this.loaded==4) {		
			this.setShadersParams();
			this.setMatrixUniforms(this);
			this.setUniforms(this);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}


}


// =====================================================
// FONCTIONS GENERALES, INITIALISATIONS
// =====================================================



// =====================================================
function initGL(canvas)
{
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.viewport(0, 0, canvas.width, canvas.height);

		gl.clearColor(0.7, 0.7, 0.7, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK); 
	} catch (e) {}
	if (!gl) {
		console.log("Could not initialise WebGL");
	}
}


// =====================================================
loadObjFile = function(OBJ3D)
{
	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var tmpMesh = new OBJ.Mesh(xhttp.responseText);
			OBJ.initMeshBuffers(gl,tmpMesh);
			OBJ3D.mesh=tmpMesh;
		}
	}


	xhttp.open("GET", OBJ3D.objName, true);
	xhttp.send();
}



// =====================================================
function loadShaders(Obj3D) {
	loadShaderText(Obj3D,'.vs');
	loadShaderText(Obj3D,'.fs');
}

// =====================================================
function loadShaderText(Obj3D,ext) {   // lecture asynchrone...
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		if(ext=='.vs') { Obj3D.vsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(ext=='.fs') { Obj3D.fsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(Obj3D.loaded==2) {
			Obj3D.loaded ++;
			compileShaders(Obj3D);
			Obj3D.loaded ++;
		}
	}
  }
  
  Obj3D.loaded = 0;
  xhttp.open("GET", Obj3D.shaderName+ext, true);
  xhttp.send();
}

// =====================================================
function compileShaders(Obj3D)
{
	Obj3D.vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(Obj3D.vshader, Obj3D.vsTxt);
	gl.compileShader(Obj3D.vshader);
	if (!gl.getShaderParameter(Obj3D.vshader, gl.COMPILE_STATUS)) {
		console.log("Vertex Shader FAILED... "+Obj3D.shaderName+".vs");
		console.log(gl.getShaderInfoLog(Obj3D.vshader));
	}

	Obj3D.fshader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(Obj3D.fshader, Obj3D.fsTxt);
	gl.compileShader(Obj3D.fshader);
	if (!gl.getShaderParameter(Obj3D.fshader, gl.COMPILE_STATUS)) {
		console.log("Fragment Shader FAILED... "+Obj3D.shaderName+".fs");
		console.log(gl.getShaderInfoLog(Obj3D.fshader));
	}

	Obj3D.shader = gl.createProgram();
	gl.attachShader(Obj3D.shader, Obj3D.vshader);
	gl.attachShader(Obj3D.shader, Obj3D.fshader);
	gl.linkProgram(Obj3D.shader);
	if (!gl.getProgramParameter(Obj3D.shader, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders");
		console.log(gl.getShaderInfoLog(Obj3D.shader));
	}
}


// =====================================================
function webGLStart() {
	
	var canvas = document.getElementById("WebGL-test");

	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
	canvas.onwheel = handleMouseWheel;

	initGL(canvas);
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	
	mat4.identity(rotMatrix);
	mat4.rotate(rotMatrix, rotX, [1, 0, 0]);
	mat4.rotate(rotMatrix, rotY, [0, 0, 1]);



	
	distCENTER = vec3.create([0,-0.2,-3]);
	
	PLANE = new plane();
	OBJ1 = new objmesh('objects/bunny.obj');
	SKYBOX = new skybox();
	
	tick();
}


// =====================================================
function convertHex(hex){
	hex = hex.replace('#','');
	
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
	b = parseInt(hex.substring(4,6), 16);

    return [r/255,g/255,b/255];
}

// =====================================================
function convertHexLight(hex){
	hex = hex.replace('#','');
	
    r = Math.min(Math.max(parseInt(hex.substring(0,2), 16),0),254);
    g = Math.min(Math.max(parseInt(hex.substring(2,4), 16),0),254);
	b = Math.min(Math.max(parseInt(hex.substring(4,6), 16),0),254);
	
    return [r/255,g/255,b/255];
}
// =====================================================
function drawScene() {

	gl.clear(gl.COLOR_BUFFER_BIT);
	//PLANE.draw();
	OBJ1.draw();
	SKYBOX.draw();
}

	





