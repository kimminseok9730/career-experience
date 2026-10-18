import * as T from '../vendor/three.module.js';
import {tissueMaterial} from './materials.mjs';
import {loadStudio} from './studio-model.mjs';
// CASE 01 모형: HRA Visible Human Male 심장 하나를 Blender 에서 실제로 잘라 만든 조각들(assets/forensic/case01).
// 심실 벽·중격·유두근 형상은 원본 그대로이고, 지방 두께·관상혈관 굵기·조직의 색과 형태는 교육용 재구성이다(의학 감수 전).
export const CASE01_PARTS=['surface','artery-1','artery-2','artery-3','artery-1-ref','artery-2-ref','artery-3-ref','muscle','muscle-ref'];
// Blender 에서 붙인 재질 이름(역할) → 화면 재질 [색, 잡음 종류].
export const ROLE_MATERIALS=Object.freeze({
 myocardium_surface:['#8a3a30','muscle'], myocardium_cut:['#7d3128','muscle'], myocardium_cut_fibrosis:['#ffffff','muscle'],
 epicardial_fat:['#e0b752','fat'], fat_cut:['#e6c262','fat'], artery_wall:['#dcc6a2','section'], cardiac_vein:['#4a2238','section'],
 blood:['#3c0f0e','section'], valve:['#cdb796','section'], great_vessel:['#c9a47a','section'],
 plaque_fibrous:['#e6dccb','section'], plaque_lipid:['#d9b052','section'], calcium:['#f2efe8','section']
});
export function roleOf(name){
 const base=String(name??'').replace(/\.\d+$/,'').replace(/__x$/,'');   // Blender 가 붙이는 .001 을 먼저 뗀다
 return Object.hasOwn(ROLE_MATERIALS,base)?base:null;
}
export function dressPart(root,unitMm=null){
 root.traverse(o=>{
  if(!o.isMesh)return;
  const dress=m=>{
   const role=roleOf(m?.name)??'myocardium_surface',[color,kind]=ROLE_MATERIALS[role];
   const t=tissueMaterial(color,kind,unitMm);t.name=role;
   if(m?.map){t.map=m.map;t.map.colorSpace=T.SRGBColorSpace;}
   m?.dispose?.();return t;
  };
  o.material=Array.isArray(o.material)?o.material.map(dress):dress(o.material);
  o.castShadow=true;o.receiveShadow=true;
 });
 return root;
}
export async function loadCase01(){
 const {GLTFLoader}=await import('../vendor/jsm/loaders/GLTFLoader.js');
 const loader=new GLTFLoader(),base=new URL('../assets/forensic/case01/',import.meta.url);
 const manifest=await (await fetch(new URL('case01-manifest.json',base))).json();
 const entries=await Promise.all(CASE01_PARTS.map(async key=>{
  const gltf=await loader.loadAsync(new URL(`case01-${key}.glb`,base).href);
  return [key,dressPart(gltf.scene,manifest.parts[key]?.mm_per_unit??null)];
 }));
 return {...Object.fromEntries(entries),...await loadStudio(loader)};
}
function cloneMaterial(m){const c=m.clone();c.onBeforeCompile=m.onBeforeCompile;c.customProgramCacheKey=m.customProgramCacheKey;return c;}
export function cloneSpecimen(part){
 const clone=part.clone(true);
 clone.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone();o.material=Array.isArray(o.material)?o.material.map(cloneMaterial):cloneMaterial(o.material);}});
 return clone;
}
