
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
uniform vec3 uRGBRefractiveIndex;		//Indice de réfraction complexeu
uniform float uNbEchantillonnage;		//Nombre de rayons pour l'echantillonnage d'importance
uniform float u_Time;				
uniform float uReflectionAmount;		//Montant de reflection 
uniform float uRefractionAmount;		//Montant de refraction

//=====================================================
uniform samplerCube skybox;
 

//=====================================================
const float M_PI = 3.14159265358;


/*
 *  Random Function
 */
//=====================================================


highp float rand(float i)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(pos3D.xy+i ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
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

	float f = fresnel(dot_ih, refractiveIndex);									//valeur de fresnel avec indice de réfraction dielectriques
	float d = beckmann(dot_nh, rugosity);										//terme de distribution
	float g = gaf_torrance_sparrow(dot_nh, dot_no, dot_ni, dot_oh, dot_ih);		//terme de géométrie

	return  (1.0-f)/M_PI * color +  (f * g * d /(4.0*dot_ni*dot_no));
}

// =====================================================

/*
 *  Fonction calculant la BRDF avec des indices de refraction des métaux(prenant en compte plusieurs longueurs d'ondes)
 */

vec3 cook_torrance_with_complex_index(float kd, float ks, vec3 color, vec3 wi, vec3 wo, vec3 normale, vec3 refractiveIndex, float rugosity){

	vec3 halfVector =  normalize((wi+wo));	

	float dot_ni =  max(0.0,dot(wi,normale));
	float dot_no =  max(0.0,dot(wo,normale));	
	float dot_nh =  max(0.0,dot(normale,halfVector));
	float dot_oh =  max(0.0,dot(wo,halfVector));		
	float dot_ih =  max(0.0,dot(wi,halfVector));

	vec3  f = fresnel_schlick(dot_ih, refractiveIndex);							//valeur de fresnel avec indice de réfraction de métaux
	float d = beckmann(dot_nh, rugosity);										//terme de distribution
	float g = gaf_torrance_sparrow(dot_nh, dot_no, dot_ni, dot_oh, dot_ih);		//terme de géométrie

	return  (f * g * d /(4.0*dot_ni*dot_no)); 
}

// =====================================================

/*
 *  Fonction echantillonnage d'importance
 */

vec3 Echantillonnage_Importance(float kd, float ks, vec3 color, vec3 wi, vec3 wo, vec3 normale, float refractiveIndex, float rugosity){

	const float N = 100000.0;
	vec3 S = vec3(0.0);
	float E1, E2;
	for(float i = 1.0 ; i <= N; i++){

		if(i > uNbEchantillonnage)
			 break;

		E1 = rand(i);
		E2 = rand(i);
		
		float PhiM = E1 * 2. * M_PI;
		float logE2 = log(1. - E2);
		
		float tanThetaM =  sqrt(-(rugosity * rugosity) * logE2);
		float tanThetaM2 = tanThetaM * tanThetaM;
		float cosThetaM = 1.0/(1.0+tanThetaM2);
		float sinThetaM = tanThetaM2 / (1.0+tanThetaM2);
		float cosPhiM = cos(PhiM);
		float sinPhiM = sin(PhiM);

		vec3 normaleM = vec3(sinThetaM * cosPhiM,  sinThetaM * sinPhiM, cosThetaM);


		vec3 col = uLightPower * uLightColor * cook_torrance_with_simple_index(uKd, uKs, color,wi,wo,normaleM,uRefractiveIndex,uRugosity) * cosThetaM;

		float pdf =  beckmann(cosThetaM, rugosity) * cosThetaM;

		S += col/pdf;	

	}
	return (S / uNbEchantillonnage); 
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

	vec3 vr = refract(vo,N2, 1.0/uRefractiveIndex);
    vr = vec3(invRMatrix * vec4(vr, 1.0));


	float dot_ni = max(dot(N2,wi),0.0);	
	vec3 color = textureCube(skybox, vi.xzy).xyz;



	if(uChoice==0)																													
			col =  uLightPower * uLightColor * lambert(color,uKd,N2,wi);																				//lambert

	else if (uChoice == 1)																
			col =  uLightPower * uLightColor * phong(uKd, uKs, color,wi,wo,N2,uShineCoeff) * dot_ni ;													//phong normalisé
			
	else if(uChoice == 2)
	
			col =  uLightPower * uLightColor * cook_torrance_with_complex_index(uKd, uKs, color, wi, wo, N2, uRGBRefractiveIndex,uRugosity) * dot_ni;	//Cook-Torrance indices métaux
	
	else if(uChoice == 3){
			col =  Echantillonnage_Importance(uKd, uKs, color, wi, wo, N2, uRefractiveIndex, uRugosity);												//Cook-Torrance echantillonnage d'importance
	
	}else{		
			color = uReflectionAmount * textureCube(skybox, vi.xzy).xyz + uRefractionAmount *  textureCube(skybox, vr.xzy).xyz;
			col =  uLightPower * uLightColor * cook_torrance_with_simple_index(uKd, uKs, color,wi,wo,N2,uRefractiveIndex,uRugosity) * dot_ni;			//Cook-Torrance indices dielectriques
		
	}


	gl_FragColor = vec4(col,1.0);
}



