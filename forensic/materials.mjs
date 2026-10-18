import * as T from '../vendor/three.module.js';
// Procedural material variation is illustrative; it is not a diagnostic tissue image.
// 잡음 세기는 조직마다 다르다. 지방은 고르고 밝게, 근육은 결이 조금 보이게.
const TISSUE={muscle:{perMm:2.7,broad:.40,grain:.09,fine:.22},section:{perMm:2.0,broad:.25,grain:.04,fine:.15},fat:{perMm:.9,broad:.16,grain:0,fine:.10}};
// unitMm: 모형 1단위가 몇 mm 인지. 주면 잡음 크기를 실제 mm 로 맞춘다(배율이 다른 조각도 같은 조직처럼 보인다).
export function tissueMaterial(color='#79524b',kind='muscle',unitMm=null){
 const p=TISSUE[kind]??TISSUE.section;
 const m=new T.MeshPhysicalMaterial({color,roughness:.47,metalness:0,clearcoat:.12,clearcoatRoughness:.32});
 m.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 tissueP;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntissueP=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 tissueP;
float tissueHash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float tissueNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(tissueHash(i),tissueHash(i+vec3(1,0,0)),f.x),mix(tissueHash(i+vec3(0,1,0)),tissueHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(tissueHash(i+vec3(0,0,1)),tissueHash(i+vec3(1,0,1)),f.x),mix(tissueHash(i+vec3(0,1,1)),tissueHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
`);
  const scale=unitMm?p.perMm*unitMm:(kind==='muscle'?115:9);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 tp=tissueP*${scale.toFixed(1)};
float broad=tissueNoise(tp*1.6);
float fine=tissueNoise(tp*37.0);
float grain=tissueNoise(tp*vec3(75.0,12.0,55.0));
diffuseColor.rgb*=${(1-p.broad*.625).toFixed(3)}+${p.broad.toFixed(3)}*broad+${p.grain.toFixed(3)}*grain;
diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.12,0.86,0.78),${p.fine.toFixed(3)}*fine);
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(fine-.5)*.14,.25,.8);');
 };
 const key='forensic-tissue-'+kind+(unitMm?'-'+unitMm.toFixed(2):'');m.customProgramCacheKey=()=>key;
 return m;
}
export function clothMaterial(){
 const n=128,data=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const v=190+((x%4===0||y%4===0)?-23:12)+Math.round(8*Math.sin(x*17+y*13));
  const i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
 }
 const tx=new T.DataTexture(data,n,n);tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(9,15);tx.needsUpdate=true;
 return new T.MeshStandardMaterial({color:'#c7d2c9',roughness:.96,bumpMap:tx,bumpScale:.002,side:T.DoubleSide});
}

