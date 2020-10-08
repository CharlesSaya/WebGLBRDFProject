
precision mediump float;

varying vec4 pos3D;



varying vec3 N;

uniform vec3 uLightPos;
uniform vec3 uLightPower;
uniform vec3 color;
uniform float uKd;
uniform float uKs;

const float M_PI = 3.14159265358;

// =====================================================

vec3 lambert( vec3 lightPower, vec3 kD ,vec3 normale,vec3 wi){
	float dotValue = dot(normale,wi);
	return lightPower * kD/M_PI * clamp(dotValue,0.0,1.0);
}

// =====================================================

float fresnel(vec3 wi,vec3 halfVector, float n){

	float c = abs(dot(normalize(wi),halfVector));
	float g = sqrt(n*n + c * c -1.0);
	float a = 0.5 * (g-c)*(g-c) / ((g+c)*(g+c));
	float b = (c*(g+c)-1.0) * (c*(g+c)-1.0) / ( (c*(g-c) +1.0) * (c*(g-c) +1.0));
	return (a * (1.0+b) ) ;	
}

// =====================================================

float beckmann(vec3 wi, vec3 halfVector, float rugosity ){
	float theta = dot(wi,halfVector);
	float a = exp(-tan(theta)*tan(theta)/(2.0*rugosity*rugosity));
	float b = M_PI * rugosity * rugosity * pow(cos(theta),4.0);
	return a/b;
}


// =====================================================

float cook_torrance(vec3 normale, vec3 halfVector, vec3 wi, vec3 wo){
	float a = 2.0 * dot(normale,halfVector) * dot(normale,wo) /(dot(wo,halfVector));
	float b = 2.0 * dot(normale,halfVector) * dot(normale,wi) /(dot(wi,halfVector));
	return min(1.0,min(a,b));
}



// =====================================================
void main(void)
{
	vec3 wi = (uLightPos - vec3(pos3D));
	vec3 wo = (- vec3(pos3D));
	vec3 halfVector =  normalize(wi+wo);
	//vec3 col = lambert(uLightPower,uKd,N,wi); 
	float n = (1.0-1.33) / (1.0+1.33);
	float c = fresnel(wi,halfVector, 1.33);

	float dot_in = abs(dot(normalize(wi),N));
	float dot_on = abs(dot(normalize(wo),N));

	vec3 col =(c/(4.0*dot_in*dot_on));
	
	gl_FragColor = vec4(col,1.0);
}



