

// =====================================================
// Mouse management
// =====================================================
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var handleLight = false;
var rotY = 0;
var rotX = -1;

// =====================================================
window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback,
									/* DOMElement Element */ element)
         {
            window.setTimeout(callback, 1000/60);
         };
})();

// ==========================================
function tick() {
	requestAnimFrame(tick);
	drawScene();
}

// =====================================================
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}


// =====================================================
function handleMouseWheel(event) {

	distCENTER[2] += event.deltaY/10.0;
}

// =====================================================
function handleMouseDown(event) {
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}


// =====================================================
function handleMouseUp(event) {
	mouseDown = false;
}

// =====================================================

/*
 *	Fonction permettant de choisir le mode de BRDF que l'on souhaite
 */

function handleButton(clicked_button){
	node0 = document.getElementById("cook_torrance_param");
	node1 = document.getElementById("coeff_param");
	node2 = document.getElementById("refractiveChoice");
	node3 = document.getElementById("phong_specularity");

	node4 = document.getElementById("rgbIndexDiv");
	node5 = document.getElementById("simpleIndexDiv");

	metal = document.getElementById("metal");
	dielectric = document.getElementById("dielectric");

	switch(clicked_button){
		case "scook_torranceButton":
			node0.style.display = "inline";
			node1.style.display = "none";
			node2.style.display = "inline";
			node3.style.display = "none";
			node4.style.display = "none";
			node5.style.display = "inline";

			dielectric.style.display = "inline";
			metal.style.display = "none";

			document.getElementById(clicked_button).disabled = true;
			document.getElementById("rcook_torranceButton").disabled = false;
			document.getElementById("phongButton").disabled = false;
			document.getElementById("lambertButton").disabled = false;
			choice = 3;
			break;
		case "rcook_torranceButton":
			node0.style.display = "inline";
			node1.style.display = "none";
			node2.style.display = "inline";
			node3.style.display = "none";
			node4.style.display = "inline";
			node5.style.display = "none";

			dielectric.style.display = "none";
			metal.style.display = "inline";

			document.getElementById("scook_torranceButton").disabled = false;
			document.getElementById(clicked_button).disabled = true;
			document.getElementById("phongButton").disabled = false;
			document.getElementById("lambertButton").disabled = false;
			choice = 2;
			break;
		case "phongButton":
			node0.style.display = "none";
			node1.style.display = "inline";
			node2.style.display = "none";
			node3.style.display = "inline";
			node4.style.display = "none";
			node5.style.display = "none";

			dielectric.style.display = "none";
			metal.style.display = "none";


			document.getElementById(clicked_button).disabled = true;
			document.getElementById("scook_torranceButton").disabled = false;
			document.getElementById("rcook_torranceButton").disabled = false;
			document.getElementById("lambertButton").disabled = false;
			choice = 1;
			break;
		default:
			node0.style.display = "none";
			node1.style.display = "none";
			node2.style.display = "none";
			node3.style.display = "none";
			node4.style.display = "none";
			node5.style.display = "none";

			dielectric.style.display = "none";
			metal.style.display = "none";


			document.getElementById(clicked_button).disabled = true;
			document.getElementById("phongButton").disabled = false;
			document.getElementById("scook_torranceButton").disabled = false;
			document.getElementById("rcook_torranceButton").disabled = false;
			choice = 0;
			break;
			
	}
}
// =====================================================

/*
 *	Fonction permettant de choisir l'indice de réfraction que l'on souhaite pour la BRDF Cook-Torrance
 */

function handleIndex(indexId){
	switch(indexId){
		case "air":
			index = 1.0;												//indice de réfraction simple
			document.getElementById("air").className = "active";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("titane").className = "";
			break;
		case "water":
			index = 1.33;
			document.getElementById("air").className = "";
			document.getElementById("water").className = "active";
			document.getElementById("glass").className = "";
			document.getElementById("titane").className = "";

			break;
		case "glass":
			index = 1.5;
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "active";
			document.getElementById("titane").className = "";

			break;
		case "titane":
			index = 2.484;
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("titane").className = "active";
			break;
		case "gold":
			rgbIndex = [1.00,0.71,0.29];								//indice de réfraction complexe
			document.getElementById("gold").className = "active";
			document.getElementById("copper").className="";
			break;
		case "copper":
			rgbIndex = [0.95,0.64,0.54];
			document.getElementById("gold").className = "";
			document.getElementById("copper").className="active";
			break;
		case "complexIndexButton":
			var r = document.getElementById("r").value;
			var g = document.getElementById("g").value;
			var b = document.getElementById("b").value;
			rgbIndex = [r,g,b];
			document.getElementById("gold").className = "";
			document.getElementById("copper").className="";
			break;

		case "simpleIndexButton":
			index = document.getElementById("simpleIndex").value;												
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("titane").className = "";
			break;
		default:
			index = 1.0;
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("gold").className = "";
			document.getElementById("copper").className="";
			break;
			
	}
	
	document.getElementById("r").value = rgbIndex[0];
	document.getElementById("g").value = rgbIndex[1];
	document.getElementById("b").value = rgbIndex[2];
	document.getElementById("simpleIndex").value = index;
}

// =====================================================
function handleMouseMove(event) {
	if(!mouseDown) return;
	if (event.ctrlKey){ 
		var canvas = document.getElementById("WebGL-test");
		var rect = canvas.getBoundingClientRect();
		xLightPos = event.clientX - (canvas.width / 2) - rect.left;
		yLightPos = - (event.clientY - (canvas.height / 2) - rect.top);
	}
	else{
		var newX = event.clientX;
		var newY = event.clientY;	
		var deltaX = newX - lastMouseX;
		var deltaY = newY - lastMouseY;
		
		if(event.shiftKey) {
			distCENTER[2] += deltaY/100.0;
		} else {

			rotY += degToRad(deltaX / 5);
			rotX += degToRad(deltaY / 5);

			mat4.identity(rotMatrix);
			mat4.rotate(rotMatrix, rotX, [1, 0, 0]);
			mat4.rotate(rotMatrix, rotY, [0, 0, 1]);
		}
		
		lastMouseX = newX;
		lastMouseY = newY;

	}
}
