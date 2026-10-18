// Fictional teaching case, adapted from the workspace's canonical design.
export const CASE_KEY='dream.forensic.case01.intake.v1';
export const KINDS={reported:'진술·보고된 정보',documented:'기록으로 확인된 정보',result:'검사·검안 소견'};
export const HYPOTHESES={cardiac:'심혈관계 자연사',trauma:'외상성 사망',neurological:'급성 신경계 질환',toxic:'외인성 물질 영향',other:'기타 자연사',undetermined:'아직 판단하기 어려움'};
export const DOCUMENTS=[
 {id:'D02',title:'사건개요 · 발견 경위',source:'수사기관 / 관계자 보고',kind:'reported',facts:['22:52 동료가 휴게공간 인근에서 반응이 없는 상태로 발견했다.','주변에 넘어진 의자와 떨어진 개인물품이 있었다.','22:35 혼자 휴게공간 방향으로 이동했다는 보고가 있다.'],question:'주변의 혼란만으로 외상성 사망을 확정할 수 있을까요?'},
 {id:'D04',title:'구급활동 기록 요약',source:'구급활동 기록',kind:'documented',facts:['발견 뒤 구급조치가 시행됐으나 회복되지 않았고, 이후 사망이 확인됐다.','중대한 외부 사고가 있었다는 명확한 현장정보는 기록되지 않았다.'],question:'심정지라는 상태와 사망을 일으킨 원인은 같은 정보일까요?'},
 {id:'D06',title:'동료 진술',source:'관계자 진술',kind:'reported',facts:['21:40 피곤하다는 취지의 말을 했다고 한다.','평소 고혈압 진료 이야기를 들은 적이 있다고 한다.','최근 병원에 갔다는 이야기를 들은 듯하지만 자세한 내용은 모른다.'],question:'전해 들은 병력에서 의료기록으로 확인해야 할 것은 무엇일까요?'},
 {id:'D07',title:'초기 의무기록',source:'의료기관 기록 요약',kind:'documented',facts:['고혈압과 이상지질혈증 진료 기록이 있다.','최근 증상과 심혈관계 평가 내용은 현재 자료에 충분히 포함되지 않았다.'],question:'위험요인이 확인됐다는 사실만으로 이번 사인을 정할 수 있을까요?'},
 {id:'D10',title:'검안 기록',source:'검안 소견 요약',kind:'result',facts:['즉시 사망을 설명할 정도의 뚜렷한 외표상 치명적 손상 근거는 확인되지 않았다.','경미한 표재성 변화가 기록됐다. 내부 장기 평가는 아직 이 자료에 없다.'],question:'외표에 치명적 손상이 없다는 사실이 내부 손상까지 배제할까요?'},
 {id:'D09',title:'보완된 최근 의무기록',source:'의료기관 추가 회신',kind:'documented',facts:['최근 수주 동안 간헐적인 흉부 불편감이 기록돼 있다.','추가 심혈관계 평가가 예정됐으나 완료되기 전에 사망했다.'],question:'어떤 가설을 더 검토할 근거가 생겼고, 무엇이 여전히 미확인일까요?'}
];
export const fresh=()=>({version:1,caseId:'FM-CASE-01',accepted:false,read:[],notes:{},request:null,hypothesis:null});
const ensure=(ok,msg)=>{if(!ok)throw new Error(msg);};
const text=x=>typeof x==='string'&&x.trim().length>=8&&x.length<=1200;
const doc=id=>DOCUMENTS.find(d=>d.id===id);
export function transition(state,a){
 const s=structuredClone(state);
 if(a.type==='accept'){s.accepted=true;return s;}
 ensure(s.accepted,'먼저 감정 의뢰사항을 확인하고 사건을 접수하세요.');
 if(a.type==='request'){
  ensure(text(a.reason),'무엇을 확인하려는지 8자 이상으로 적어 주세요.');
  s.request={reason:a.reason.trim()};return s;
 }
 if(a.type==='read'||a.type==='record'){
  const d=doc(a.id);ensure(d,'알 수 없는 자료입니다.');
  ensure(d.id!=='D09'||s.request,'최근 의무기록 보완을 먼저 요청하세요.');
  if(a.type==='read'){if(!s.read.includes(a.id))s.read.push(a.id);return s;}
  ensure(s.read.includes(a.id),'자료를 먼저 열어 확인하세요.');
  ensure(a.kind===d.kind,`이 자료는 ${d.source}에서 왔습니다. 정보 상태를 다시 구분해 보세요.`);
  ensure(text(a.note),'이 자료에서 확인한 사실을 8자 이상으로 기록해 주세요.');
  s.notes[a.id]={note:a.note.trim(),kind:a.kind};return s;
 }
 if(a.type==='hypothesis'){
  ensure(Object.hasOwn(HYPOTHESES,a.primary)&&Object.hasOwn(HYPOTHESES,a.alternative)&&a.primary!==a.alternative,'우선 검토할 가설과 다른 가능성을 각각 선택하세요.');
  ensure(Array.isArray(a.evidence)&&a.evidence.length>0&&a.evidence.every(id=>s.notes[id]),'기록한 자료 중 근거를 하나 이상 연결하세요.');
  ensure(text(a.reason),'가설의 이유와 아직 모르는 점을 8자 이상 적어 주세요.');
  s.hypothesis={primary:a.primary,alternative:a.alternative,evidence:[...new Set(a.evidence)],reason:a.reason.trim()};return s;
 }
 throw new Error('지원하지 않는 동작입니다.');
}
export const ready=s=>s.accepted&&!!s.request&&DOCUMENTS.every(d=>s.notes[d.id])&&!!s.hypothesis;
export function restoreCase(raw){
 if(raw==null)return {state:fresh(),status:'empty'};
 try{
  const v=JSON.parse(raw);if(v?.version!==1)return {state:fresh(),status:'incompatible'};
  ensure(v.caseId==='FM-CASE-01'&&typeof v.accepted==='boolean'&&Array.isArray(v.read)&&v.notes&&typeof v.notes==='object','invalid');
  ensure(v.read.every(id=>doc(id))&&new Set(v.read).size===v.read.length,'invalid');
  let s=fresh();if(v.accepted)s=transition(s,{type:'accept'});
  if(v.request)s=transition(s,{type:'request',reason:v.request.reason});
  for(const id of v.read)s=transition(s,{type:'read',id});
  for(const [id,n] of Object.entries(v.notes))s=transition(s,{type:'record',id,...n});
  if(v.hypothesis)s=transition(s,{type:'hypothesis',...v.hypothesis});
  return {state:s,status:'ok'};
 }catch{return {state:fresh(),status:'corrupt'};}
}
