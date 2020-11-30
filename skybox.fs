
precision mediump float;

varying vec2 texCoords;
varying vec3 pos;

void main(void)
{
    gl_FragColor = vec4(texCoords,0.0,1.0);
}



