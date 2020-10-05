
precision mediump float;

varying vec4 pos3D;



varying vec3 N;

uniform vec3 uLightPos;
uniform vec3 uLightPower;
uniform vec3 uKd;

const float M_PI = 3.14159265358;

// =====================================================

vec3 lambert( vec3 lightPower, vec3 kD ,vec3 normale,vec3 wi){
	float dotValue = dot(normale,wi);
	return lightPower * kD/M_PI * clamp(dotValue,0.0,1.0);
}

// =====================================================

float fresnel(vec3 wi,vec3 wo, vec3 normale, float n){
	float c = dot(wi,normale);
	float g = sqrt(n*n + c * c -1.0);
	float a = 0.5 * (g-c)*(g-c) / ((g+c)*(g+c));
	float b = (c*(g+c)-1.0) * (c*(g+c)-1.0) / ( (c*(g-c) +1.0) * (c*(g-c) +1.0) );
	return (a * (1.0+b) ) ;
}

// =====================================================
void main(void)
{
	vec3 wi = normalize(uLightPos - vec3(pos3D));
	vec3 wo = normalize(vec3(0.0) - vec3(pos3D));
	vec3 m = normalize(wi + wo);
	// vec3 col = lambert(uLightPower,uKd,N,wi); 
	vec3 col = fresnel(wi,wo, m, 1.33) * vec3(1.0); 
	
	gl_FragColor = vec4(col,1.0);
}



