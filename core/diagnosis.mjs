// Source principles: docs/diagnosis-sources.md. All numerical data are training fixtures.
export const CHECKS={
 upstreamHistory:{label:'상위 모선 · 정지 직전 전압 기록',station:'hmi',mode:'voltage',unit:'V',channels:['L1–L2','L2–L3','L3–L1'],values:[400,399,401],context:'09:41:59 · B 운전 중 · 상위 모선 설치 기록계'},
 branchHistory:{label:'B 분기 · 정지 직전 전압 기록',station:'hmi',mode:'voltage',unit:'V',channels:['L1–L2','L2–L3','L3–L1'],context:'09:41:59 · B 운전 중 · B 입력 접속부 하류 / KM 상류 설치 기록계'},
 control:{label:'B 분기 장치 상태 피드백',station:'hmi',mode:'events',unit:'상태',channels:['QF 차단기','KM 접촉기','FR 과부하계전기'],values:['ON','OPEN','TRIP']},
 events:{label:'보호계전기 사건 기록',station:'hmi',mode:'events',unit:'시각',channels:['정지 전','보호 동작','운전 피드백'],values:['09:41:55 RUN','09:42:00 OVERLOAD','09:42:01 STOP']},
 voltage:{label:'B 분기 설치계기 · 현재 선간전압',station:'mcc',mode:'voltage',unit:'V',channels:['L1–L2','L2–L3','L3–L1']},
 current:{label:'B 전류 기록계 · 정지 직전 30초',station:'hmi',mode:'current',unit:'A',channels:['L1','L2','L3']},
 now:{label:'B 분기 설치계기 · 현재 전류',station:'mcc',mode:'current',unit:'A',channels:['L1','L2','L3'],values:[0,0,0]},
};
export const PURPOSES={supply:'현재 선간전압 확인',history:'동일 시각 상위·분기 전압 비교',load:'정지 직전 전류 분포 확인',sequence:'보호 동작 전후 순서 확인',running:'현재 전류 확인',control:'차단기·접촉기·보호계전기 상태 구분'};
const checkPurpose={events:'sequence',voltage:'supply',current:'load',now:'running',control:'control',upstreamHistory:'history',branchHistory:'history'};
export function voltageComparisonRows(d){
 const a=d.readings.upstreamHistory,b=d.readings.branchHistory;
 if(!a||!b)return [];
 return CHECKS.upstreamHistory.channels.map((channel,i)=>({channel,upstream:Number(a.values[i]),branch:Number(b.values[i])}));
}
export function saveVoltageComparison(d,scope,note){
 if(d.status==='handedoff')throw new Error('인계 완료 후 근거는 변경할 수 없습니다.');
 const rows=voltageComparisonRows(d);
 if(rows.length!==3||rows.some(r=>![r.upstream,r.branch].every(v=>Number.isFinite(v)&&v>=0)))throw new Error('두 지점의 정지 직전 전압 기록을 먼저 확인하세요.');
 if(!['branch','upstream','unresolved'].includes(scope)||typeof note!=='string'||note.trim().length<15||note.length>1500)throw new Error('점검 범위와 비교 이유를 15자 이상 기록하세요.');
 return {...d,comparison:{scope,note:note.trim()},status:'investigating',response:'기록을 갱신했습니다. 근거를 대조하여 점검 요청을 작성하세요.',route:null,job:null};
}
export function createDiagnosis(variant='load'){
 if(!['load','supply'].includes(variant))throw new Error('알 수 없는 사례');
 return {variant,visual:null,readings:{},attempts:[],status:'investigating',response:'추가 확인 대상을 직접 선택하세요.',route:null,job:null};
}
export function saveVisualObservation(d,record){
 if(d.status==='handedoff')throw new Error('인계 완료 후 근거는 변경할 수 없습니다.');
 if(!record||!['L1','L2','L3','none','unseen'].includes(record.location)||!['damage','clear','unseen'].includes(record.appearance)||!['suspect','unknown','normal','confirmed'].includes(record.conclusion)||typeof record.note!=='string'||record.note.trim().length<15||record.note.length>1500)throw new Error('관찰 위치·외관·판단 범위와 이유를 15자 이상 기록하세요.');
 const visual={location:record.location,appearance:record.appearance,conclusion:record.conclusion,note:record.note.trim()};
 if(typeof record.photo==='string'&&record.photo.startsWith('data:image/jpeg;base64,')&&record.photo.length<800000)visual.photo=record.photo;
 return {...d,visual,status:'investigating',response:'기록을 갱신했습니다. 근거를 대조하여 점검 요청을 작성하세요.',route:null,job:null};
}
export function instrumentReading(d,id,mode){
 if(!Object.hasOwn(CHECKS,id))throw new Error('확인 대상이 아닙니다.');const c=CHECKS[id];
 if(mode!==c.mode)return {...c,valid:false,values:['—','—','—'],message:'선택한 계기 모드와 데이터 종류가 맞지 않습니다. 이 화면은 근거로 저장할 수 없습니다.'};
 let values=c.values;
 if(id==='voltage')values=d.variant==='load'?[400,399,401]:[400,330,398];
 if(id==='current')values=d.variant==='load'?[93,94,93]:[81,115,85];
 if(id==='branchHistory')values=d.variant==='load'?[400,399,401]:[350,352,400];
 if(c.context)return {...c,valid:true,values,message:c.context+' · 동기화된 교육용 기록이며 현재 측정값이 아닙니다.'};
 return {...c,valid:true,values,message:id==='control'?'가상 보조접점 피드백입니다. QF ON은 펌프 운전이나 무전압 확인을 뜻하지 않습니다.':id==='events'?'가상 보호 동작과 운전 피드백의 시간 기록입니다.':id==='now'?'현재 STOP 상태의 순간값입니다.':id==='current'?'정지 직전 기록입니다. 가상 명판 정격전류 70 A.':'가상 계기 기록 · 선간전압 기준 400 V. 제조사 판정 한계값을 대체하지 않습니다.'};
}
export function saveDiagnosticReading(d,id,mode,values,interpretation,purpose,photo){
 if(d.status==='handedoff')throw new Error('인계 완료 후 근거는 변경할 수 없습니다.');
 const r=instrumentReading(d,id,mode);if(!r.valid)throw new Error(r.message);
 if(!['normal','abnormal','insufficient'].includes(interpretation))throw new Error('읽은 값의 의미를 선택하세요.');
 if(purpose!==undefined&&!Object.hasOwn(PURPOSES,purpose))throw new Error('확인 목적을 선택하세요.');
 if(photo!==undefined&&(typeof photo!=='string'||!photo.startsWith('data:image/jpeg;base64,')||photo.length>=800000))throw new Error('현장 기록 사진 형식이나 크기를 확인하세요.');
 if(!Array.isArray(values)||values.length!==3||values.some(v=>typeof v!=='string'||!v.trim()||v.length>80))throw new Error('세 채널을 모두 직접 기록하세요.');
 const next={...d,readings:{...d.readings,[id]:{mode,values:values.map(v=>v.trim()),interpretation,...(purpose===undefined?{}:{purpose})}},status:'investigating',response:'기록을 갱신했습니다. 근거를 대조하여 점검 요청을 작성하세요.',route:null,job:null};
 if(photo!==undefined)next.readings[id].photo=photo;
 if(['upstreamHistory','branchHistory'].includes(id))delete next.comparison;
 return next;
}
export function requestDiagnosticHandover(d,{hypothesis,route,evidence,note}){
 if(d.status==='handedoff')throw new Error('이미 인계가 완료되었습니다.');
 if(!['load','supply','unknown'].includes(hypothesis)||!['mechanical','electrical','specialist','restart'].includes(route)||typeof note!=='string'||note.trim().length<15||note.length>1500)throw new Error('가설·요청 대상과 판단 이유(15자 이상)를 작성하세요.');
 if(!Array.isArray(evidence)||evidence.some(id=>!d.readings[id]))throw new Error('실제로 기록한 근거를 선택하세요.');
 const decision={hypothesis,route,evidence:[...new Set(evidence)],note:note.trim()};
 const done=(status,response,job=null)=>({...d,status,response,route,job,attempts:[...d.attempts,{...decision,status,response}]});
 if(route==='restart')return done('returned','운전 담당자: 원인 확인과 작업 승인이 없어 재기동 요청을 보류합니다. B 정지 상태를 유지합니다.');
 if(!d.visual)return done('returned','B반 내부 외관 기록이 없습니다. 문을 열어 접속부 세 곳을 비교하고, 내부를 바라보며 R로 관찰을 기록하세요. 가상 관찰이며 실제 활선 개방을 허용하는 절차가 아닙니다.');
 const v=d.visual;
 if(['normal','confirmed'].includes(v.conclusion))return done('returned','외관만으로 정상이나 고장 원인을 확정할 수 없습니다. 관찰 사실과 원인 추정을 구분해 주세요.');
 if(d.variant==='supply'?(v.location!=='L2'||v.appearance!=='damage'||v.conclusion!=='suspect'):(v.location!=='none'||v.appearance!=='clear'||v.conclusion!=='unknown'))return done('returned','외관 기록을 다시 확인해 주세요. B반 L1·L2·L3의 피복과 접속부를 비교하고, 보지 못한 부위를 정상으로 기록하지 마세요.');
 if(!['events','voltage','current'].every(id=>decision.evidence.includes(id)))return done('returned','점검 담당자: 사건 시각, 분기 전압, 정지 직전 전류를 함께 대조할 근거가 부족합니다. 현재 전류 0 A만으로 정지 원인을 알 수 없습니다.');
 for(const id of decision.evidence){const r=instrumentReading(d,id,d.readings[id].mode);if(r.values.some((v,i)=>typeof v==='number'?Math.abs(Number(d.readings[id].values[i])-v)>.1||!Number.isFinite(Number(d.readings[id].values[i])):String(v)!==d.readings[id].values[i]))return done('returned',`${CHECKS[id].label}: 입력값과 계기 기록이 다릅니다. 해당 채널을 다시 확인해 주세요.`);}
 if(decision.evidence.some(id=>d.readings[id].purpose&&d.readings[id].purpose!==checkPurpose[id]))return done('returned','선택한 확인 목적과 기록 종류가 다릅니다. 전압·전류, 현재값·정지 직전값, 사건 순서·장치 상태를 구분해 확인 목적을 보완하세요.');
 const expected={events:'abnormal',voltage:d.variant==='load'?'normal':'abnormal',current:'abnormal',now:'insufficient',control:'abnormal',upstreamHistory:'normal',branchHistory:d.variant==='load'?'normal':'abnormal'};
 if(decision.evidence.some(id=>d.readings[id].interpretation!==expected[id]))return done('returned','점검 담당자: 기록값에 대한 해석을 다시 검토해 주세요. 현재값과 정지 직전 기록을 구분하고 세 상과 명판 기준을 비교해야 합니다.');
 if(d.comparison){
  if(!['upstreamHistory','branchHistory'].every(id=>decision.evidence.includes(id)))return done('returned','두 지점 비교 판단에 사용한 상위·분기 전압 기록을 모두 첨부하세요.');
  if(d.comparison.scope==='upstream'||(d.variant==='load'&&d.comparison.scope==='branch'))return done('returned','같은 시각의 두 지점 전압을 다시 대조하세요. 상위 전압이 균형이라는 기록으로 상위 계통 고장을 확정할 수 없고, 두 지점의 차이가 없다는 기록만으로 분기 고장이나 기계 고장을 확정할 수도 없습니다.');
 }
 if(hypothesis==='unknown'&&route==='specialist')return done('accepted','추가 진단팀: 확정하지 않은 범위를 명시한 근거를 접수했습니다. 전문 점검 결과를 요청할 수 있습니다.','specialist');
 const expectedRoute=d.variant==='load'?'mechanical':'electrical';
 if(hypothesis!==d.variant||route!==expectedRoute)return done('returned','점검 담당자: 선택한 원인 후보·요청 대상이 전압과 전류 기록의 조합을 충분히 설명하지 못합니다. 기록을 비교해 요청을 보완하세요.');
 return done('accepted',route==='mechanical'?'기계 점검팀: 부하 증가 가능성으로 접수. 전기적 원인 전체가 배제된 것은 아닙니다. 승인된 정지·격리 작업 이후 전문 점검 결과를 회신하겠습니다.':'전기 점검팀: B 분기 전압 이상 근거로 접수. 승인된 정지·격리 작업 이후 전문 점검 결과를 회신하겠습니다.',route);
}
export function receiveFollowup(d){
 if(d.status!=='accepted')throw new Error('근거가 접수된 점검 요청이 먼저 필요합니다.');
 const finding=d.variant==='load'?'기계 점검팀 회신: 별도 작업허가·격리 후 인양 점검에서 임펠러 이물 걸림을 확인했습니다. 제거·손상 점검과 복구 후 시험운전 계획을 요청합니다.':'전기 점검팀 회신: 별도 작업허가·격리 후 B 분기 접속부 손상을 확인했습니다. 접속부 보수와 복구 후 전압·전류 재확인 계획을 요청합니다.';
 return {...d,status:'handedoff',response:finding+' (가상 후속 작업 회신 — 플레이어가 수행한 작업이 아닙니다.)'};
}
export function restoreDiagnosis(raw){
 if(!raw)return createDiagnosis();let d=createDiagnosis(raw.variant);
 for(const [id,r] of Object.entries(raw.readings??{}))d=saveDiagnosticReading(d,id,r.mode,r.values,r.interpretation,r.purpose,r.photo);
 if(raw.visual)d=saveVisualObservation(d,raw.visual);
 if(raw.comparison)d=saveVoltageComparison(d,raw.comparison.scope,raw.comparison.note);
 // Editing evidence cancels the current request; never replay it implicitly on reload.
 const attempts=raw.attempts??[];
 if(!Array.isArray(attempts)||!['investigating','returned','accepted','handedoff'].includes(raw.status))throw new Error('손상된 점검 기록');
 if(raw.status!=='investigating'){
  if(!attempts.length)throw new Error('점검 요청 기록이 없습니다.');
  d=requestDiagnosticHandover(d,attempts.at(-1));
  if(raw.status==='handedoff')d=receiveFollowup(d);
  if(d.status!==raw.status)throw new Error('근거와 점검 상태가 일치하지 않습니다.');
 }
 d.attempts=attempts.map(a=>({hypothesis:a.hypothesis,route:a.route,evidence:a.evidence,note:a.note,status:a.status,response:a.response}));
 return d;
}
