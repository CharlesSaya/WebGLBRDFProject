
precision mediump float;

varying vec4 pos3D;						//Position 3D du point
varying vec3 N;							//Normale 

uniform int uChoice;					//Choix de la BRDF


uniform vec3 uLightPos;					//Position de la lumière
uniform vec3 uLightPower;				//Puissance de la lumière
uniform vec3 uLightColor;				//Couleur de la lumière
uniform float uShineCoeff;				//Coefficient de brillance Phong
uniform vec3 uColor;					//Couleur de l'objet

//=====================================================
uniform float uKd;						//Coefficient du terme diffus
uniform float uKs;						//Coefficient du terme spéculaire
uniform float uRugosity;				//Rugosité de l'objet

//=====================================================
uniform float uRefractiveIndex;			//Indice de réfraction simple
uniform vec3 uRGBRefractiveIndex;		//Indice de réfraction complexe

//=====================================================
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

vec3 phong(float kD, float kS, vec3 diffuseColor, vec3 specularColor, vec3 wi, vec3 wo, vec3 normale, float shineCoeff){
	float nl =dot(normale, wi);
	vec3 reflectedRay = normalize(reflect(-wi,normale));
	float ro = dot(reflectedRay,wo);
	return   (kD/M_PI * diffuseColor + kS * ((shineCoeff+2.0)/2.0*M_PI) * pow(max(ro,0.0),shineCoeff) * specularColor);

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
	float cosTm = dot(normale, halfVector);
	float cosTm2 = cosTm * cosTm;
	float sinTm2 = 1.0 - cosTm2;
	float tanTm2 = sinTm2 / cosTm2;
	float a = exp(-tanTm2/(2.0*rugosity*rugosity));
	float b = M_PI * rugosity * rugosity * cosTm2 * cosTm2;
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

vec3 brdf_with_complex_index(float kd, float ks, vec3 color, vec3 fresnel,float beckmann, float cook_torrance, vec3 wi, vec3 wo, vec3 normale){
	float dot_in = abs(dot(wi,normale));
	float dot_on = abs(dot(wo,normale));
	return  kd/M_PI * uColor + ks *  (fresnel * cook_torrance * beckmann /(4.0*dot_in*dot_on)) * vec3(1.0);
}



// =====================================================

/*
 *  Main calculant la couleur du fragment
 */

void main(void)
{
	vec3 col = vec3(0);
	vec3 wi = normalize(uLightPos - vec3(pos3D));
	vec3 wo = normalize(- vec3(pos3D));
	vec3 halfVector =  normalize((wi+wo));												

	float f = fresnel(wi,halfVector,uRefractiveIndex);									//valeur de fresnel avec indice de réfraction simples
	vec3 fSchlick = schlick(wi,halfVector,uRGBRefractiveIndex);							//valeur de fresnel avec indice de réfraction complexes

	float d = beckmann(N, wi,halfVector,uRugosity);
	float g = torrance_sparrow(N, halfVector,wi,wo);

	if(uChoice==0)																													
			col = lambert(uLightPower,uKd,N,wi,uLightColor);

	else if (uChoice == 1)																
			col =  uLightPower * phong(uKd, uKs, uColor,vec3(1.0),wi,wo,N,uShineCoeff)  * clamp(dot(N,wi),0.0,1.0)  * uLightColor;

	else if (uChoice == 2)																					
			col =  uLightPower * brdf_with_complex_index(uKd, uKs, uColor,fSchlick,d,g,wi,wo,N) * clamp(dot(N,wi),0.0,1.0)  * uLightColor;
	else
			col =  uLightPower * brdf(uKd, uKs, uColor,f,d,g,wi,wo,N) * clamp(dot(N,wi),0.0,1.0)  * uLightColor;		//Dé-commenter pour utiliser des indices de réfraction simples
	
	gl_FragColor = vec4(col,1.0);
}



