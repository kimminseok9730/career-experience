// Student-visible data contains observations only, never the case's final diagnosis.
export const STORAGE_KEY='dream.forensic.heart.v1';
// 5 = 사례 심장을 다시 HRA 하나로 통일, v0.6 은 표면의 일반 구조 참고(2026-10-18). 4 = v0.6 외형·내부 + 별도 HRA 단면.
// 3 = HRA 심장 하나를 실제로 잘라 만든 모형(2026-10-15). 2 = HRA 외형 + 별도 도식 단면. 위치 표시는 같은 모형 버전에서만 다시 보인다.
export const MODEL_VERSION=5;
// 설명은 장소와 보는 방법만 알린다. 소견(좁아짐·색 변화의 성격 등)은 학생이 직접 찾고 기록한다.
export const SOURCES=Object.freeze({
 surface:{title:'심장 표면',label:'표면',description:'HRA 인체 해부학 자료의 심장 하나로 만든 교육용 모형입니다. 겉의 지방과 혈관 굵기, 색·재질은 관찰을 위해 재구성했으며 이 사례의 실제 검체가 아닙니다. 방향을 돌려 각 면의 형태와 혈관 경로를 살펴보고, 참고 구조로 별도 제작한 정상 심장 모형과 견주어 보세요.'},
 'artery-1':{title:'관상동맥 · 단면 1',label:'단면 1',description:'심장 앞면 고랑을 따라 내려가는 관상동맥을 심장 바닥 쪽에서 가로로 자른 면입니다. 혈관을 둘러싼 지방과 아래쪽 심근이 함께 보입니다. 참고 구조와 같은 배율로 비교할 수 있습니다.'},
 'artery-2':{title:'관상동맥 · 단면 2',label:'단면 2',description:'같은 관상동맥을 단면 1보다 심장 끝 쪽으로 약 1cm 내려가 자른 면입니다. 벽과 안쪽 통로의 모양을 단면 1과 견주어 보세요.'},
 'artery-3':{title:'관상동맥 · 단면 3',label:'단면 3',description:'단면 2보다 다시 약 1cm 심장 끝 쪽에서 자른 면입니다. 세 단면을 오가며 벽의 두께와 안쪽 통로의 크기를 따로 기록하세요.'},
 muscle:{title:'심근 · 가로 단면',label:'심근',description:'심장을 심장 끝 가까이에서 가로로 자른 면입니다. 왼쪽·오른쪽 심실의 빈 공간과 그것을 둘러싼 근육 벽이 보입니다. 색의 차이만으로 변화의 원인이나 시기를 알 수 없습니다.'}
});
export const OBSERVATIONS={different:'형태·색에 차이가 보임',similar:'뚜렷한 차이를 찾기 어려움',uncertain:'판단하기 어려움'};
export const INTERPRETATIONS={pending:'추가 확인이 필요함',compare:'다른 자료와 대조하고 싶음',unsure:'아직 해석하기 어려움'};
export const QUESTIONS={tissue:'이 부위의 조직 변화는 어떤 성격일까?',extent:'다른 단면에서도 같은 모습이 이어질까?',history:'병력·발견 상황과 어떤 관련이 있을까?'};
export function createState(){return {version:1,caseId:'FM-CASE-01-heart-study',visited:[],records:[],questions:[]};}
const copy=x=>structuredClone(x);
const known=k=>Object.hasOwn(SOURCES,k);
function requireThat(ok,message){if(!ok)throw new Error(message);}
const finite=(n)=>Number.isFinite(n)&&Math.abs(n)<=100;
function validView(v){return v&&finite(v.yaw)&&finite(v.pitch)&&Number.isFinite(v.zoom)&&v.zoom>=.5&&v.zoom<=2;}
function validMark(m){return m===null||(Array.isArray(m)&&m.length===3&&m.every(finite));}
export function visit(s,key){
 requireThat(known(key),'알 수 없는 관찰 부위입니다.');
 return s.visited.includes(key)?s:{...s,visited:[...s.visited,key]};
}
function validRecord(r){
 return r&&known(r.sourceKey)&&Object.hasOwn(OBSERVATIONS,r.observation)&&Object.hasOwn(INTERPRETATIONS,r.interpretation)
 &&typeof r.note==='string'&&r.note.length<=1200&&validMark(r.mark)&&validView(r.view);
}
export function addRecord(s,input){
 requireThat(s.visited.includes(input.sourceKey),'먼저 해당 부위를 관찰해 주세요.');
 const r={modelVersion:MODEL_VERSION,sourceKey:input.sourceKey,observation:input.observation,interpretation:input.interpretation,note:input.note??'',mark:input.mark??null,view:input.view??{yaw:0,pitch:0,zoom:1}};
 requireThat(validRecord(r),'관찰 내용이나 위치를 확인해 주세요.');
 requireThat(s.records.length<200,'보관 가능한 기록 수에 도달했습니다. 기록을 내보낸 뒤 새 관찰을 시작해 주세요.');
 return {...s,records:[...s.records,{...copy(r),id:'r'+(s.records.length+1),createdAt:new Date().toISOString()}]};
}
export function addQuestion(s,input){
 requireThat(s.records.some(r=>r.id===input.recordId),'질문에 연결할 관찰 기록을 선택해 주세요.');
 requireThat(Object.hasOwn(QUESTIONS,input.question),'확인할 질문을 선택해 주세요.');
 const others=s.questions.filter(q=>q.recordId!==input.recordId);
 return {...s,questions:[...others,{recordId:input.recordId,question:input.question}]};
}
export function progress(s){
 const artery=s.records.some(r=>r.sourceKey.startsWith('artery-'));
 const muscle=s.records.some(r=>r.sourceKey==='muscle');
 return {views:s.visited.length,artery,muscle,question:s.questions.length>0,complete:s.visited.length===5&&artery&&muscle&&s.questions.length>0};
}
export function restore(raw){
 if(raw===null||raw===undefined)return {state:createState(),status:'empty'};
 try{
  const s=JSON.parse(raw);
  if(s&&s.version!==1)return {state:createState(),status:'incompatible'};
  requireThat(s&&s.caseId===createState().caseId&&Array.isArray(s.visited)&&Array.isArray(s.records)&&Array.isArray(s.questions),'invalid');
  requireThat(s.visited.every(known)&&new Set(s.visited).size===s.visited.length&&s.records.length<=200,'invalid');
  requireThat(s.records.every((r,i)=>validRecord(r)&&r.id==='r'+(i+1)&&s.visited.includes(r.sourceKey)&&typeof r.createdAt==='string'&&Number.isFinite(Date.parse(r.createdAt))),'invalid');
  requireThat(s.questions.length<=s.records.length&&new Set(s.questions.map(q=>q.recordId)).size===s.questions.length&&s.questions.every(q=>s.records.some(r=>r.id===q.recordId)&&Object.hasOwn(QUESTIONS,q.question)),'invalid');
  return {state:copy(s),status:'ok'};
 }catch{return {state:createState(),status:'corrupt'};}
}


export function recordView(record){
 const legacy=record.modelVersion!==MODEL_VERSION;
 return {...structuredClone(record),legacy,...(legacy?{mark:null,view:{yaw:0,pitch:0,zoom:1}}:{})};
}
