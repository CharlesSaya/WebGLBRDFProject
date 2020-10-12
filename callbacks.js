

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

	switch(clicked_button){
		case "cook_torranceButton":
			node0.style.visibility = "visible";
			node1.style.visibility = "visible";
			choice = 2;
			break;
		case "phongButton":
			node1.style.visibility = "visible";
			node0.style.visibility = "hidden";
			choice = 1;
			break;
		default:
			node0.style.visibility = "hidden";
			node1.style.visibility = "hidden";
			choice = 0;
			break;
			
	}
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
