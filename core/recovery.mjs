// Fictional delegated repair and operator-run trial; not a real commissioning procedure.
import {trialSample} from './trial-model.mjs';
export const TRIAL_CHECKS={
 voltage:{title:'시험운전 · B 선간전압',channels:['L1–L2','L2–L3','L3–L1'],units:['V','V','V'],values:[400,399,401]},
 current:{title:'시험운전 · B 전류',channels:['L1','L2','L3'],units:['A','A','A'],values:[66,68,67]},
 process:{title:'시험운전 · B 토출·경보',channels:['분기 유량','토출 압력','재발 경보 수'],units:['m³/min','MPa','건'],values:[3.2,.35,0]},
};
// A trial record is a transcription of one instant, so it is only ever compared with the reading at its own elapsed time.
const matchesReading=(values,shown)=>shown.every((v,i)=>Math.abs(Number(values[i])-v)<.001);
// Keep the last recorded trial when a retrial has no observations; never merge different trials.
const stoppedRecords=r=>Object.keys(r.records).length?r.records:r.previousRecords;
function evidenceGap(r){
 for(const id of ['voltage','current']){
  const rec=r.previousRecords[id],title=TRIAL_CHECKS[id].title;
  if(!rec)return title+' 기록이 없습니다. 승인된 재시험에서 직접 읽고 기록하세요.';
  if(rec.elapsed<30)return title+' 기록이 T+'+rec.elapsed+'초입니다. 부하 조건의 변화는 30초 이후에 나타나므로 그 뒤 판독으로 다시 기록하세요.';
  if(!matchesReading(rec.values,trialSample(rec.elapsed,false)[id]))return title+' 기록이 T+'+rec.elapsed+'초 표시값과 다릅니다. 기록창의 사진과 대조해 다시 기록하세요.';
  if(rec.meaning!=='stop')return title+' 기록에 이상 판단이 없습니다. 판독값을 근거로 판단을 다시 선택하세요.';
 }
 return null;
}
export function createRecovery({dynamic=false}={}){return {stage:'review',records:{},log:[],feedback:'전문팀의 보수 계획은 접수됐지만 작업 종료·운전 인계 승인은 아직 없습니다.',note:'',...(dynamic?{dynamic:true,elapsed:0,resolved:false,tripped:false,previousRecords:{},waterOffset:0}:{})};}
export function trialReadings(r,id){
 if(!['trial','verified'].includes(r.stage)||!Object.hasOwn(TRIAL_CHECKS,id))throw new Error('시험운전 중 해당 설치계기에서만 확인할 수 있습니다.');
 return r.dynamic?{...TRIAL_CHECKS[id],values:trialSample(r.elapsed,r.resolved)[id]}:TRIAL_CHECKS[id];
}
export function recordTrial(r,id,values,meaning){
 trialReadings(r,id);if(r.stage==='verified')throw new Error('인계 검토 완료 후 기록은 변경할 수 없습니다.');
 if(!Array.isArray(values)||values.length!==3||values.some(v=>typeof v!=='string'||!v.trim()||v.length>40)||!['acceptable','stop','unknown'].includes(meaning))throw new Error('세 값을 직접 기록하고 판단을 선택하세요.');
 const record={id,values:values.map(v=>v.trim()),meaning,...(r.dynamic?{elapsed:r.elapsed}: {})};
 return {...r,records:{...r.records,[id]:{values:record.values,meaning,...(r.dynamic?{elapsed:r.elapsed}: {})}},log:[...r.log,{action:'record',...record}],feedback:r.dynamic&&!matchesReading(record.values,trialReadings(r,id).values)?'기록을 저장했지만 T+'+r.elapsed+'초 표시값과 다릅니다. 기록창의 사진을 다시 확인하고 필요하면 같은 항목을 다시 기록하세요.':'시험 기록을 저장했습니다. 세 항목과 작업 회신을 대조하세요.'};
}
export function recoveryAction(r,action,options={}){
 if(r.stage==='verified')throw new Error('이미 인계 검토가 완료됐습니다.');
 const finish=(stage,feedback,extra={})=>({...r,...extra,stage,feedback,log:[...r.log,{action,...(action==='trial'?{enclosuresClosed:options.enclosuresClosed===true}:{}),...(['accept','request-retrial','inspect-electrical','inspect-mechanical'].includes(action)?{note:options.note}:{}),...(action==='advance'?{seconds:options.seconds}:{})}]});
 if(r.dynamic&&action==='advance'&&r.stage==='trial'){
  if(!Number.isInteger(options.seconds)||options.seconds<1||options.seconds>30)throw new Error('시험 시간은 1~30초씩 진행합니다.');
  const elapsed=Math.min(r.resolved?120:90,r.elapsed+options.seconds);
  const waterOffset=r.waterOffset+trialSample(elapsed,r.resolved).waterDelta-trialSample(r.elapsed,r.resolved).waterDelta;
  if(!r.resolved&&elapsed>=90)return finish('stopped','보호 정지: 전압·전류 편차와 토출 저하가 지속됐습니다. 기록을 검토하고 추가 점검 범위를 선택하세요.',{elapsed,waterOffset,tripped:true,previousRecords:stoppedRecords(r),records:{}});
  return finish('trial','시험 진행 중 · HMI에서 변화 추세를 관찰하세요.',{elapsed,waterOffset});
 }
 if(r.dynamic&&['inspect-electrical','inspect-mechanical'].includes(action)&&r.stage==='stopped'){
  if(typeof options.note!=='string'||options.note.trim().length<20||options.note.length>2000)throw new Error('관찰 근거와 요청 이유를 20자 이상 남기세요.');
  if(action==='inspect-mechanical')return finish('stopped','가상 기계팀: 해당 범위에서 원인을 확인하지 못했습니다. 전기적 이상은 해소됐다고 판단할 수 없습니다. 기존 시험 기록과 다른 점검 범위를 검토하세요.');
  const gap=evidenceGap(r);
  if(gap)return finish('stopped','전기팀 보완 요청 · '+gap);
  return finish('stopped','가상 전기팀: 부하 조건 추가 점검으로 B 분기 경로의 잔여 접속 이상을 확인·보수했습니다. 초기 외관 부위 보수와 별개이며 재시험 승인은 별도로 요청하세요.',{resolved:true});
 }
 if(r.dynamic&&action==='request-handback'&&r.stage==='review')return finish('ready','가상 전문팀: 외관 손상 부위 보수 및 작업 종료 확인. 부하 조건의 전체 경로는 아직 미검증입니다. 담당자가 관찰 시험을 승인했습니다.');
 if(action==='request-handback'&&r.stage==='review')return finish('ready','가상 전문팀 회신: 손상 접속부 교체·관련 점검 완료. 작업책임자 인원·공구 철수 및 작업 종료 확인, 운전 담당자 시험 승인 접수. 플레이어가 정비한 것은 아닙니다.');
 if(action==='trial'){
  if(r.stage==='stopped')return finish('stopped','중지 사유와 설비별 냉각·기동 횟수 조건을 운전 담당자가 재검토한 뒤 재시험 승인을 받아야 합니다.');
  if(r.stage!=='ready')return finish(r.stage,'운전 담당자: 작업 종료·시험 승인 자료가 없어 요청을 보류했습니다.');
  if(!options.enclosuresClosed)return finish(r.stage,'MCC 문이 완전히 닫히지 않았습니다. 몸이 문 회전 경로에 있으면 문이 닫히지 않으니, 문 앞에서 한 걸음 물러나 완전히 닫힌 것을 확인한 뒤 다시 요청하세요.');
  return finish('trial',r.dynamic?'시험 시작 · 현장 화면에서 교육용 시간이 흐릅니다. 기록창·백그라운드에서는 일시정지합니다. 이상 징후를 기록하고 중지 요청하세요.':'운전 담당자가 승인된 시험을 수행합니다. 교육용 T+60초 기록을 HMI에서 읽고, 이상 시 중지 요청하세요.',{records:{},...(r.dynamic?{elapsed:0,tripped:false}: {})});
 }
 if(action==='stop'&&r.stage==='trial')return finish('stopped','운전 담당자가 B 시험을 중지했습니다. 새 시험의 정상 확인에는 새 관찰 기록이 필요합니다.',{records:{},...(r.dynamic?{previousRecords:stoppedRecords(r)}: {})});
 if(action==='request-retrial'&&r.stage==='stopped'){
  if(typeof options.note!=='string'||options.note.trim().length<20||options.note.length>2000)throw new Error('중지 사유와 담당자에게 재확인할 조건을 20자 이상 작성하세요.');
  return finish('ready','가상 운전 담당자 회신: 중지 사유 검토 및 설비별 냉각·기동 횟수 조건 확인 후 재시험 승인. 대기 시간은 교육용으로 압축했으며 실제 설비의 재기동 허가는 아닙니다.');
 }
 if(action==='hold')return finish(r.stage,'현재 상태를 유지하고 인계를 보류했습니다. 미확인 자료를 보완하세요.');
 if(action==='accept'&&r.stage==='trial'){
  if(typeof options.note!=='string'||options.note.trim().length<20||options.note.length>2000)throw new Error('관찰 범위와 남은 확인 사항을 20자 이상 작성하세요.');
  if(r.dynamic&&(!r.resolved||r.elapsed<60))return finish('trial','인계 보류: 미해결 이상 또는 관찰 시간 부족입니다. 추가 점검과 보수 후 60초 이상 재시험을 관찰하세요.');
  const valid=Object.entries(TRIAL_CHECKS).every(([id,c])=>{const rec=r.records[id];return rec?.meaning==='acceptable'&&(!r.dynamic||rec.elapsed>=60)&&c.values.every((v,i)=>Number.isFinite(Number(rec.values[i]))&&Math.abs(Number(rec.values[i])-v)<.001);});
  if(!valid)return finish('trial','인계 보류: 전압·전류·토출/경보 세 기록의 값과 판단을 확인하세요. RUN 표시 하나로 복구 결과를 인정할 수 없습니다.');
  return finish('verified','관찰한 시험 기록과 전문팀 회신을 묶어 최종 인계할 준비가 됐습니다. 실제 운전 승인을 대신하지 않습니다.',{note:options.note.trim()});
 }
 throw new Error('현재 단계에서 수행할 수 없는 업무입니다.');
}
export function restoreRecovery(raw){
 if(!raw||!Array.isArray(raw.log))throw new Error('손상된 복구 이력');
 let r=createRecovery({dynamic:raw.dynamic===true});for(const entry of raw.log)r=entry.action==='record'?recordTrial(r,entry.id,entry.values,entry.meaning):recoveryAction(r,entry.action,entry);
 if(r.stage!==raw.stage)throw new Error('복구 이력과 상태가 일치하지 않습니다.');return r;
}
export function recoveryPlant(plant,r){
 if(!r||r.stage==='review')return plant;
 return {...plant,waterLevelM:r.dynamic?Math.max(0,Math.min(11,plant.waterLevelM+r.waterOffset)):plant.waterLevelM,alarm:r.tripped?'pump-fault':'none',pumps:{...plant.pumps,'PM-103-B':r.tripped?'faulted':['trial','verified'].includes(r.stage)?'running':'stopped'}};
}
