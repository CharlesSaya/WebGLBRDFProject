
precision mediump float;

varying vec4 pos3D;						//Position 3D du point
varying vec3 N;							//Normale 
varying mat4 invRMatrix;

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
uniform samplerCube skybox;
 

//=====================================================
const float M_PI = 3.14159265358;


/*
 *  random Function
 */
//=====================================================
float rand(){
    return fract(sin(dot(pos3D.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// =====================================================

/*
 *  Lambert shading
 */

vec3 lambert(vec3 diffuseColor, float kD, vec3 normale, vec3 wi){
	float dot_ni = max(0.0,dot(normale,wi));
	return  kD/M_PI * diffuseColor * dot_ni;
}

// =====================================================

/*
 *  Normalized phong shading
 */

vec3 phong(float kD, float kS, vec3 diffuseColor, vec3 wi, vec3 wo, vec3 normale, float shineCoeff){
	vec3 reflectedRay = normalize(reflect(-wi,normale));
	float dot_ro = dot(reflectedRay,wo);
	return  (kD/M_PI * diffuseColor + kS * ((shineCoeff+2.0)/2.0*M_PI) * pow(max(dot_ro,0.0),shineCoeff));

}

// =====================================================

/*
 *  Fonction calculant le terme de fresnel de la BRDF
 */

float fresnel(float dot_ih, float n){

	float c = abs(dot_ih);
	float g = sqrt(n*n + c * c -1.0);
	float gmc = g-c;
	float gpc = g+c;

	float a = 0.5 * gmc*gmc / (gpc*gpc);
	float b = (c*gpc-1.0) * (c*gpc-1.0) / ( (c*gmc+1.0) * (c*gmc +1.0));
	return (a * (1.0+b)) ;	
}

// =====================================================

/*
 *  Fonction calculant le terme de fresnel de la BRDF avec l'approximation de Schlick
 */

vec3 fresnel_schlick(float dot_ih, vec3 rf0){
	return rf0 + (1.0-rf0)*pow(1.0-dot_ih,5.0); 
}

// =====================================================

/*
 *  Fonction calculant le terme de distribution de la BRDF avec Beckmann
 */


float beckmann(float dot_nh, float rugosity ){
	float cosTm2 = dot_nh * dot_nh;
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

float gaf_torrance_sparrow(float dot_nh, float dot_no, float dot_ni, float dot_oh, float dot_ih){
	float a = 2.0 * dot_nh * dot_no /(dot_oh);
	float b = 2.0 * dot_nh * dot_ni /(dot_ih);
	return min(1.0,min(a,b));
}

// =====================================================

/*
 *  Fonction calculant la BRDF avec des indices de refraction simples 
 */


vec3 cook_torrance_with_simple_index(float kd, float ks, vec3 color, vec3 wi, vec3 wo, vec3 normale, float refractiveIndex, float rugosity){

	vec3 halfVector =  normalize((wi+wo));		

	float dot_ni =  max(0.0,dot(wi,normale));									
	float dot_no =  max(0.0,dot(wo,normale));	
	float dot_nh =  max(0.0,dot(normale,halfVector));
	float dot_oh =  max(0.0,dot(wo,halfVector));		
	float dot_ih =  max(0.0,dot(wi,halfVector));						

	float f = fresnel(dot_ih, refractiveIndex);									//valeur de fresnel avec indice de réfraction simples
	float d = beckmann(dot_nh, rugosity);										//terme de distribution
	float g = gaf_torrance_sparrow(dot_nh, dot_no, dot_ni, dot_oh, dot_ih);		//terme de géométrie

	return  (1.0-f)/M_PI * color +  (f * g * d /(4.0*dot_ni*dot_no));
}

// =====================================================

/*
 *  Fonction calculant la BRDF avec des indices de refraction complexes (prenant en compte plusieurs longueurs d'ondes)
 */

vec3 cook_torrance_with_complex_index(float kd, float ks, vec3 color, vec3 wi, vec3 wo, vec3 normale, vec3 refractiveIndex, float rugosity){

	vec3 halfVector =  normalize((wi+wo));	

	float dot_ni =  max(0.0,dot(wi,normale));
	float dot_no =  max(0.0,dot(wo,normale));	
	float dot_nh =  max(0.0,dot(normale,halfVector));
	float dot_oh =  max(0.0,dot(wo,halfVector));		
	float dot_ih =  max(0.0,dot(wi,halfVector));

	vec3  f = fresnel_schlick(dot_ih, refractiveIndex);							//valeur de fresnel avec indice de réfraction complexes
	float d = beckmann(dot_nh, rugosity);										//terme de distribution
	float g = gaf_torrance_sparrow(dot_nh, dot_no, dot_ni, dot_oh, dot_ih);		//terme de géométrie

	return  (f * g * d /(4.0*dot_ni*dot_no)); 
}

// =====================================================

/*
 *  Fonction calculant le terme de distribution de la BRDF avec Beckmann anisotrope
 */


float beckmann_EchantImp(float cosTm, float sinTheta, float rugosity ){
	float cosTm2 = cosTm * cosTm;
	float sinTm2 = 1.0 - cosTm2;
	float tanTm2 = sinTm2 / cosTm2;	
	float a = exp(-tanTm2 / ((rugosity * rugosity)));
	float b =  rugosity * rugosity * cosTm2 * cosTm;
	return (2.0*sinTheta/b) * a;
}

// =====================================================

/*
 *  Fonction echantillonnage d'importance
 */

vec3 Echantillonnage_Importance(float kd, float ks, vec3 color, vec3 wi, vec3 wo, vec3 normale, float refractiveIndex, float rugosity){

	const float N = 1000.0;
	vec3 halfVector =  normalize((wi+wo));	
	float dot_nh =  max(0.0,dot(normale,halfVector));
	float dot_ni =  max(0.0,dot(wi,normale));
	vec3 S = vec3(0.0);
	float E1, E2;
	for(float i = 1.0 ; i < N; i++){
		E1 = rand();
		E2 = rand();

		float PhiM = E1 * 2. * M_PI;
		float thetaM = atan(sqrt(- (rugosity * rugosity) * log(1. - E2)));

		float cosTheta = cos(thetaM);
		float sinTheta = sin(thetaM);

		vec3 sampling = normalize(vec3(sinTheta * cos(PhiM),  sinTheta * sin(PhiM), cosTheta));
		vec3 wi2 = normalize(reflect(wo,sampling));

		vec3 col = uLightPower * uLightColor * cook_torrance_with_simple_index(uKd, uKs, color,wi,wo,sampling ,uRefractiveIndex,uRugosity) * dot_ni;
		float pdf = beckmann_EchantImp(thetaM, sinTheta, rugosity);
		pdf/=(4.0*(dot(wo,wi2)));

		S += vec3(col.x/pdf, col.y/pdf, col.z/pdf);
	}

	return  S / N; 
}


// =====================================================

/*
 *  Main calculant la couleur du fragment
 */

void main(void)
{
	vec3 col = vec3(0);
	vec3 wi = normalize(uLightPos - vec3(pos3D));
	vec3 wo = normalize(- vec3(pos3D));							//caméra en (0,0,0)

	vec3 N2 = normalize(N);

	
	vec3 vo = normalize(vec3(pos3D));
	vec3 vi = reflect(vo,N2);
	vi = vec3(invRMatrix * vec4(vi, 1.0));



	vec3 color = textureCube(skybox, vi.xzy).xyz; // slider a faire


	// vec3 Nview2 = normalize(Nview);

	// vec3 reflectedRay = normalize(reflect(-wo,Nview2));

	float dot_ni = max(dot(N2,wi),0.0);	
	
	// vec3 color = textureCube(skybox,reflectedRay).xyz;

	if(uChoice==0)																													
			col =  uLightPower * uLightColor * lambert(color,uKd,N2,wi);																				//lambert

	else if (uChoice == 1)																
			col =  uLightPower * uLightColor * phong(uKd, uKs, color,wi,wo,N2,uShineCoeff) * dot_ni ;													//phong normalisé
			
	else if(uChoice == 2)
			col =  uLightPower * uLightColor * cook_torrance_with_complex_index(uKd, uKs, color, wi, wo, N2, uRGBRefractiveIndex,uRugosity) * dot_ni;	//Cook-Torrance indices complexes

	else{																		
			//col =  uLightPower * uLightColor * cook_torrance_with_simple_index(uKd, uKs, color,wi,wo,N2,uRefractiveIndex,uRugosity) * dot_ni;			//Cook-Torrance indices simples
			col = Echantillonnage_Importance(uKd, uKs, color, wi, wo, N2, uRefractiveIndex, uRugosity);
	}


	gl_FragColor = vec4(col,1.0);
}



