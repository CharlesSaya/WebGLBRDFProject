

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

function handleButton(clicked_button){
	node0 = document.getElementById("cook_torrance_param");
	node1 = document.getElementById("coeff_param");
	node2 = document.getElementById("refractiveChoice");
	node3 = document.getElementById("phong_specularity");



	switch(clicked_button){
		case "cook_torranceButton":
			node0.style.visibility = "visible";
			node1.style.visibility = "visible";
			node2.style.visibility = "visible";
			node3.style.visibility = "hidden";
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
			document.getElementById(clicked_button).disabled = true;
			document.getElementById("cook_torranceButton").disabled = false;
			document.getElementById("lambertButton").disabled = false;
			choice = 1;
			break;
		default:
			node0.style.visibility = "hidden";
			node1.style.visibility = "hidden";
			node2.style.visibility = "hidden";
			node3.style.visibility = "hidden";
			document.getElementById(clicked_button).disabled = true;
			document.getElementById("phongButton").disabled = false;
			document.getElementById("cook_torranceButton").disabled = false;
			choice = 0;
			break;
			
	}
}
// =====================================================

function handleIndex(indexId){
	switch(indexId){
		case "air":
			index = 1.0;
			rgbIndex = [0.0,0.0,0.0];
			document.getElementById("air").className = "active";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("gold").className = "";
			break;
		case "water":
			index = 1.33;
			rgbIndex = [0.02,0.02,0.02];
			document.getElementById("air").className = "";
			document.getElementById("water").className = "active";
			document.getElementById("glass").className = "";
			document.getElementById("gold").className = "";
			break;
		case "glass":
			index = 1.5;
			rgbIndex = [0.08,0.08,0.08];
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "active";
			document.getElementById("gold").className = "";
			break;
		case "gold":
			index = 2.484;
			rgbIndex = [1.00,0.71,0.29];
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("gold").className = "active";
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
			break;
		default:
			index = 1.0;
			document.getElementById("air").className = "";
			document.getElementById("water").className = "";
			document.getElementById("glass").className = "";
			document.getElementById("gold").className = "";
			break;
			
	}
	
	//	document.getElementById("other").value = index;
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
