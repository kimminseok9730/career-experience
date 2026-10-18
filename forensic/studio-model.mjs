import * as T from 'three';
import {tissueMaterial} from './studio-tissue.mjs';
export async function loadStudio(loader){
 const base=new URL('../assets/forensic/studio-v06/',import.meta.url);
 const response=await fetch(new URL('anatomy.json',base));
 if(!response.ok)throw Error('상세 심장 목록을 불러오지 못했습니다.');
 const catalog=await response.json();
 const gltf=await loader.loadAsync(new URL('heart-anatomy.glb',base).href);
 const entries=new Map(catalog.parts.map(p=>[p.id,p]));
 gltf.scene.traverse(m=>{if(!m.isMesh)return;const part=entries.get(m.name)||entries.get(m.parent.name);if(!part)throw Error('심장 부위 정보가 없습니다: '+m.name);m.userData.part=part;m.material=tissueMaterial(part.kind);m.castShadow=true;m.receiveShadow=true;});
 // Keep original vertex units for the tissue shader; normalize only the parent transform.
 const bounds=new T.Box3().setFromObject(gltf.scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 const root=new T.Group();root.add(gltf.scene);gltf.scene.position.sub(center);root.scale.setScalar(3.2/Math.max(size.x,size.y,size.z));
 // 사례 심장(HRA)과 다른 별도 제작 모형이다. 사례의 검체로 쓰지 않고, 심장 표면 화면의 「일반 구조 참고」로만 보여 준다.
 return {'surface-ref':root};
}
