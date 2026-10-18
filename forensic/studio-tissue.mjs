import * as THREE from 'three';

const noiseGLSL=`
varying vec3 vTissue;
float tissueHash(vec3 p){p=fract(p*0.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float tissueNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(tissueHash(i),tissueHash(i+vec3(1,0,0)),f.x),
                mix(tissueHash(i+vec3(0,1,0)),tissueHash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(tissueHash(i+vec3(0,0,1)),tissueHash(i+vec3(1,0,1)),f.x),
                mix(tissueHash(i+vec3(0,1,1)),tissueHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
`;

export function tissueMaterial(kind){
 const vessel=['artery','vein','coronary','cardiac_vein'].includes(kind);
 const membrane=['valve','chord','annulus'].includes(kind);
 const mat=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:kind==='fat'?.54:membrane?.48:vessel?.43:.49,
  metalness:0,clearcoat:membrane?.13:.23,clearcoatRoughness:.27,
  envMapIntensity:.45,side:THREE.DoubleSide});
 mat.customProgramCacheKey=()=>`tissue-v2-${kind}`;
 mat.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 vTissue;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTissue=position/0.035;');
  s.fragmentShader=noiseGLSL+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    float localGrain=tissueNoise(vTissue*41.0);
    roughnessFactor=clamp(roughnessFactor+(localGrain-0.5)*0.15,0.29,0.70);`);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    vec3 warped=vTissue+0.025*(localGrain-0.5);
    float relief=tissueNoise(warped*34.0)*${membrane?'0.000004':'0.000010'};
    relief+=tissueNoise(warped*vec3(83.0,17.0,69.0))*${membrane?'0.000002':'0.000006'};
    vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);
    vec3 r1=cross(sy,normal),r2=cross(normal,sx);
    float det=dot(sx,r1);
    vec3 grad=sign(det)*(dFdx(relief)*r1+dFdy(relief)*r2);
    normal=normalize(abs(det)*normal-grad);
  `);
 };
 return mat;
}

export function studioEnvironment(renderer){
 const env=new THREE.Scene();env.background=new THREE.Color('#33393b');
 const panels=[];
 for(const [position,size,color] of [
  [[-3,4,2],[3,2],'#fff1dc'],[[3,2,-2],[2,3],'#ccddeb'],[[0,5,-1],[4,1.5],'#f6e8d8']]){
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(...size),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
  panel.position.set(...position);panel.lookAt(0,0,0);env.add(panel);panels.push(panel);
 }
 const generator=new THREE.PMREMGenerator(renderer),target=generator.fromScene(env,.08);
 generator.dispose();panels.forEach(p=>{p.geometry.dispose();p.material.dispose();});
 return target;
}
