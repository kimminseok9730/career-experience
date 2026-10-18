import * as T from 'three';

// Deterministic surface detail; no external texture requests.
function texture(kind){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d');let seed=37;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 ctx.fillStyle=kind==='steel'?'#b6baba':kind==='floor'?'#a5afac':'#d8dfdc';ctx.fillRect(0,0,512,512);
 for(let i=0;i<(kind==='steel'?1600:18000);i++){
  const v=Math.floor(100+random()*100);ctx.fillStyle=`rgba(${v},${v},${v},${kind==='steel'?.07:kind==='wall'?.025:.08})`;
  const x=random()*512,y=random()*512;
  ctx.fillRect(x,y,kind==='steel'?30+random()*180:1+random()*2,kind==='steel'?.5:1+random()*2);
 }
 const map=new T.CanvasTexture(canvas);map.wrapS=map.wrapT=T.RepeatWrapping;map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;return map;
}
export function roomMaterials(){
 const floor=texture('floor');floor.repeat.set(7,8);
 const wall=texture('wall');wall.repeat.set(3,2);
 const steel=texture('steel');steel.repeat.set(2,2);
 return {
  floor:new T.MeshStandardMaterial({map:floor,bumpMap:floor,bumpScale:.0008,color:'#c4cbc6',roughness:.64,metalness:.03}),
  wall:new T.MeshStandardMaterial({map:wall,bumpMap:wall,bumpScale:.0004,color:'#edece6',roughness:.85}),
  steel:new T.MeshPhysicalMaterial({map:steel,bumpMap:steel,bumpScale:.00012,color:'#dce1df',metalness:.88,roughness:.27,clearcoat:.15}),
 };
}
