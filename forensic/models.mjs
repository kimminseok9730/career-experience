import {cloneSpecimen} from './anatomy.mjs';

// 관찰 부위 → 불러 둔 CASE 01 조각. 참고(reference)는 같은 자리를 같은 배율로 자른 조각이다.
// 심장 표면의 참고는 별도 제작한 상세 정상 심장(v0.6). 단면들의 참고는 같은 자리를 병변 없이 자른 조각.
export function partName(key,reference=false){
 return reference?key+'-ref':key;
}
export function createSpecimen(key,reference=false,parts=null){
 if(!parts)throw new Error('사례 모형을 먼저 불러와야 합니다.');
 const part=parts[partName(key,reference)];
 if(!part)throw new Error('알 수 없는 관찰 부위입니다: '+key);
 return cloneSpecimen(part);
}
