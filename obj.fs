
precision mediump float;

varying vec4 pos3D;
varying vec3 N;

uniform int uChoice;


uniform vec3 uLightPos;
uniform vec3 uLightPower;
uniform vec3 uLightColor;
uniform float uSpecularityPower;
uniform vec3 uColor;


uniform float uKd;
uniform float uKs;
uniform float uRugosity;

uniform float uRefractiveIndex;
uniform vec3 uRGBRefractiveIndex;

const float M_PI = 3.14159265358;

// =====================================================

/*
 *  Lambert shading
 */

vec3 lambert( vec3 lightPower, float kD, vec3 normale, vec3 wi, vec3 lightcolor){
	float dotValue = dot(normale,wi);
	return lightPower * kD/M_PI * uColor * clamp(dotValue,0.0,1.0) * lightcolor;
}

// =====================================================

/*
 *  Normalized phong shading
 */

vec3 phong(float kD, float kS, vec3 diffuseColor, vec3 specularColor, vec3 wi, vec3 wo, vec3 normale, float specularityPower){
	float nl =dot(normale, wi);
	vec3 reflectedRay = normalize(reflect(-wi,normale));
	float ro = dot(reflectedRay,wo);
	return   (kD/M_PI * diffuseColor + kS * ((specularityPower+2.0)/2.0*M_PI) * pow(max(ro,0.0),specularityPower) * specularColor);

}

// =====================================================

/*
 *  Fonction calculant le terme de fresnel de la BRDF
 */

float fresnel(vec3 wi,vec3 halfVector, float n){

	float c = abs(dot(wi,halfVector));
	float g = sqrt(n*n + c * c -1.0);
	float a = 0.5 * (g-c)*(g-c) / ((g+c)*(g+c));
	float b = (c*(g+c)-1.0) * (c*(g+c)-1.0) / ( (c*(g-c) +1.0) * (c*(g-c) +1.0));
	return (a * (1.0+b)) ;	
}


// =====================================================

/*
 *  Fonction calculant le terme de fresnel de la BRDF avec l'approximation de Schlick
 */

vec3 schlick(vec3 wi,vec3 halfVector, vec3 rf0){
	return rf0 + (1.0-rf0)*pow(1.0-dot(halfVector,wi),5.0); 
}

// =====================================================


/*
 *  Fonction calculant le terme de distribution de la BRDF avec Beckmann
 */


float beckmann(vec3 normale, vec3 wi, vec3 halfVector, float rugosity ){
	float theta = acos(dot(normale, halfVector));
	float a = exp(-tan(theta)*tan(theta)/(2.0*rugosity*rugosity));
	float b = M_PI * rugosity * rugosity * pow(cos(theta),4.0);
	return a/b;
}



// =====================================================

/*
 *  Fonction calculant le terme de masquage de la BRDF avec Torrance-Sparrow
 */

float torrance_sparrow(vec3 normale, vec3 halfVector, vec3 wi, vec3 wo){
	float a = 2.0 * dot(normale,halfVector) * dot(normale,wo) /(dot(wo,halfVector));
	float b = 2.0 * dot(normale,halfVector) * dot(normale,wi) /(dot(wi,halfVector));
	return min(1.0,min(a,b));
}

// =====================================================

/*
 *  Fonction calculant la BRDF avec des indices de refraction simples 
 */


vec3 brdf(float kd, float ks, vec3 color, float fresnel,float beckmann, float cook_torrance, vec3 wi, vec3 wo, vec3 normale){
	float dot_in = abs(dot(wi,normale));
	float dot_on = abs(dot(wo,normale));

	return  kd/M_PI * uColor + ks *  (fresnel * cook_torrance * beckmann /(4.0*dot_in*dot_on)) * vec3(1.0);
}

// =====================================================

/*
 *  Fonction calculant la BRDF avec des indices de refraction complexes (prenant en compte plusieurs longueurs d'ondes)
 */

vec3 brdfSchlick(float kd, float ks, vec3 color, vec3 fresnel,float beckmann, float cook_torrance, vec3 wi, vec3 wo, vec3 normale){
	float dot_in = abs(dot(wi,normale));
	float dot_on = abs(dot(wo,normale));
	return  kd/M_PI * uColor + ks *  (fresnel * cook_torrance * beckmann /(4.0*dot_in*dot_on)) * vec3(1.0);
}



// =====================================================
void main(void)
{
	vec3 col = vec3(0);
	vec3 wi = normalize(uLightPos - vec3(pos3D));
	vec3 wo = normalize(- vec3(pos3D));
	vec3 halfVector =  normalize((wi+wo));	

	float f = fresnel(wi,halfVector,uRefractiveIndex);				
	vec3 fSchlick = schlick(wi,halfVector,uRGBRefractiveIndex);

	float d = beckmann(N, wi,halfVector,uRugosity);
	float g = torrance_sparrow(N, halfVector,wi,wo);

	if(uChoice==0)
			col = lambert(uLightPower,uKd,N,wi,uLightColor);
	else if (uChoice == 1)
			col =  uLightPower * phong(uKd, uKs, uColor,vec3(1.0),wi,wo,N,uSpecularityPower)  * clamp(dot(N,wi),0.0,1.0)  * uLightColor;
	else
			//col =  uLightPower * brdf(uKd, uKs, uColor,f,d,g,wi,wo,N) * clamp(dot(N,wi),0.0,1.0)  * uLightColor;
			col =  uLightPower * brdfSchlick(uKd, uKs, uColor,fSchlick,d,g,wi,wo,N) * clamp(dot(N,wi),0.0,1.0)  * uLightColor;
	
	gl_FragColor = vec4(col,1.0);
}



