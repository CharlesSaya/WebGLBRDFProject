

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

	img0 = document.getElementById("CT1");
	img00 = document.getElementById("CT1i");
	img1 = document.getElementById("CT2");

	switch(clicked_button){
		case "scook_torranceButton":
			node0.style.visibility = "visible";
			node1.style.visibility = "visible";
			node2.style.visibility = "visible";
			node3.style.visibility = "hidden";
			img0.style.visibility = "visible";
			img00.style.visibility = "visible";
			img1.style.visibility = "hidden";
			document.getElementById(clicked_button).disabled = true;
			document.getElementById("rcook_torranceButton").disabled = false;
			document.getElementById("phongButton").disabled = false;
			document.getElementById("lambertButton").disabled = false;
			choice = 3;
			break;
		case "rcook_torranceButton":
			node0.style.visibility = "visible";
			node1.style.visibility = "visible";
			node2.style.visibility = "visible";
			node3.style.visibility = "hidden";
			img0.style.visibility = "hidden";
			img00.style.visibility = "hidden";
			img1.style.visibility = "visible";
			document.getElementById("scook_torranceButton").disabled = false;
			document.getElementById(clicked_button).disabled = true;
			document.getElementById("phongButton").disabled = false;
			document.getElementById("lambertButton").disabled = false;
			choice = 2;
			break;
		case "phongButton":
			node1.style.visibility = "visible";
			node0.style.visibility = "hidden";
			node2.style.visibility = "hidden";
			node3.style.visibility = "visible";	
			img0.style.visibility = "hidden";
			img00.style.visibility = "hidden";
			img1.style.visibility = "hidden";
			document.getElementById(clicked_button).disabled = true;
			document.getElementById("scook_torranceButton").disabled = false;
			document.getElementById("rcook_torranceButton").disabled = false;
			document.getElementById("lambertButton").disabled = false;
			choice = 1;
			break;
		default:
			node0.style.visibility = "hidden";
			node1.style.visibility = "hidden";
			node2.style.visibility = "hidden";
			node3.style.visibility = "hidden";
			img0.style.visibility = "hidden";
			img00.style.visibility = "hidden";
			img1.style.visibility = "hidden";
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
			rgbIndex = [0.0,0.0,0.0];									//indice de réfraction complexe
			document.getElementById("air").className = "active";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("titane").className = "";
			document.getElementById("gold").className = "";
			document.getElementById("copper").className="";
			break;
		case "water":
			index = 1.33;
			rgbIndex = [0.02,0.02,0.02];
			document.getElementById("air").className = "";
			document.getElementById("water").className = "active";
			document.getElementById("glass").className = "";
			document.getElementById("titane").className = "";
			document.getElementById("gold").className = "";
			document.getElementById("copper").className="";
			break;
		case "glass":
			index = 1.5;
			rgbIndex = [0.08,0.08,0.08];
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "active";
			document.getElementById("titane").className = "";
			document.getElementById("gold").className = "";
			document.getElementById("copper").className="";
			break;
		case "titane":
			index = 2.484;
			rgbIndex = [1.00,0.71,0.29];
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("titane").className = "active";
			document.getElementById("gold").className = "";
			document.getElementById("copper").className="";
			break;
		case "gold":
			index = 1;
			rgbIndex = [1.00,0.71,0.29];
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("titane").className = "";
			document.getElementById("gold").className = "active";
			document.getElementById("copper").className="";
			break;
		case "copper":
			index = 1;
			rgbIndex = [0.95,0.64,0.54];
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("titane").className = "";
			document.getElementById("gold").className = "";
			document.getElementById("copper").className="active";
			break;
		case "refrIndButton":
			//index = document.getElementById("other").value;
			var r = document.getElementById("r").value;
			var g = document.getElementById("g").value;
			var b = document.getElementById("b").value;
			rgbIndex = [r,g,b];
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("gold").className = "";
			document.getElementById("copper").className="";
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
	document.getElementById("other").value = index;
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
