
precision mediump float;

varying vec4 pos3D;
varying vec3 N;

uniform vec3 uLightPos;
uniform vec3 uLightPower;
uniform vec3 uColor;

uniform float uKa;
uniform float uKd;
uniform float uKs;
uniform float uRugosity;

const float M_PI = 3.14159265358;
const float WATER_INDEX = 1.33;
const float GLASS_INDEX = 1.5;


// =====================================================

vec3 lambert( vec3 lightPower, vec3 kD ,vec3 normale,vec3 wi){
	float dotValue = dot(normale,wi);
	return lightPower * kD/M_PI * clamp(dotValue,0.0,1.0);
}

// =====================================================

vec3 phong(float kA, float kD, float kS, vec3 ambientColor, vec3 diffuseColor, vec3 specularColor, vec3 wi, vec3 wo, vec3 normale){
	float nl =dot(normale, wi);
	vec3 reflectedRay = normalize(reflect(-wi,normale));
	float ro = dot(reflectedRay,wo);
	return kA * ambientColor + kD * diffuseColor * max(nl,0.0) + kS* specularColor* pow(max(ro,0.0),20.0);

}

// =====================================================
float fresnel(vec3 wi,vec3 halfVector, float n){

	float c = abs(dot(wi,halfVector));
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
float brdf(float kD, float kS, float fresnel,float beckmann, float cook_torrance, vec3 wi, vec3 wo, vec3 normale){
	float dot_in = abs(dot(wi,normale));
	float dot_on = abs(dot(wo,normale));

	return 0./M_PI + (1.0 * fresnel * cook_torrance * beckmann /(4.0*dot_in*dot_on)) ;
}


// =====================================================
void main(void)
{
	vec3 wi = normalize(uLightPos - vec3(pos3D));
	vec3 wo = normalize(- vec3(pos3D));
	vec3 halfVector =  normalize((wi+wo)/2.0);


	//vec3 col = lambert(uLightPower,uKd,N,wi); 
	float f = fresnel(wi,halfVector,1.33);
	float d = beckmann(wi,halfVector,uRugosity);
	float g = cook_torrance(N, halfVector,wi,wo);

	vec3 col =vec3(brdf(uKd,uKs,f,d,g,wi,wo,N) )	;
	
	gl_FragColor = vec4(col,1.0);
}



