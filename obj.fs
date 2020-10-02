
precision mediump float;

varying vec4 pos3D;



varying vec3 N;

uniform vec3 uLightPos;
uniform vec3 uLightPower;
uniform vec3 uKd;

const float M_PI = 3.14159265358;

// =====================================================

vec3 lambert( vec3 lightPower, vec3 kD ,vec3 normale,vec3 lightDir){
	float dotValue = dot(normale,lightDir);
	return lightPower * kD/M_PI * clamp(dotValue,0.0,1.0);
}

// =====================================================
void main(void)
{
	vec3 wi = normalize(uLightPos - vec3(pos3D));
	vec3 col = lambert(uLightPower,uKd,N,wi); 
			
	gl_FragColor = vec4(col,1.0);
}



