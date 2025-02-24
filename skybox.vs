attribute vec3 aVertexPosition;
attribute vec2 aTexCoords;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 texCoords;
varying vec3 pos;


void main(void) {
	texCoords = aTexCoords;
	pos = aVertexPosition;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
