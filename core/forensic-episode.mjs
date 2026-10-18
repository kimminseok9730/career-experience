import {progress} from './forensic-observation.mjs';
export const EPISODE_KEY='dream.forensic.episode.v1';
export const STATIONS=[
 {id:'briefing',title:'사건 브리핑',x:3.43,y:1.45,z:1.8},
 {id:'heart',title:'심장 관찰대',x:1.28,y:1.235,z:.1},
 {id:'terminal',title:'감정 단말기',x:2.05,y:1.40,z:-3.12},
];
export const freshEpisode=()=>({version:1,briefed:false,completed:null});
export function nextTask(s,obs,consult){
 if(s.completed)return {id:'complete',station:'briefing',title:'관찰 업무 인계 완료',detail:'인계 기록을 다시 확인하거나 자유롭게 관찰할 수 있습니다.',index:4};
 if(!s.briefed)return {id:'briefing',station:'briefing',title:'사건 브리핑 확인',detail:'오른쪽 벽의 사건 파일에 다가가 E를 누르세요.',index:0};
 const p=progress(obs);
 if(!p.complete)return {id:'heart',station:'heart',title:'심장 관찰과 질문 기록',detail:`관찰 ${p.views}/5 · 혈관 기록 ${p.artery?'✓':'—'} · 내부 기록 ${p.muscle?'✓':'—'} · 질문 ${p.question?'✓':'—'}`,index:1};
 if(!consult.received||!consult.reflection)return {id:'terminal',station:'terminal',title:'전문감정 의뢰와 회신 확인',detail:'뒤쪽 카운터의 단말기에서 관찰 질문을 이어가세요.',index:2};
 return {id:'handoff',station:'briefing',title:'사건 파일에 업무 인계',detail:'오른쪽 벽의 사건 파일로 돌아가 기록을 정리하세요.',index:3};
}
export function finishEpisode(s,obs,consult){
 if(nextTask(s,obs,consult).id!=='handoff')throw Error('관찰 기록과 회신 해석을 먼저 마쳐 주세요.');
 return {...s,completed:{at:new Date().toISOString(),records:obs.records.length,questions:obs.questions.length,supported:consult.reflection.supported,uncertain:consult.reflection.uncertain}};
}
export function restoreEpisode(raw){
 if(raw==null)return {state:freshEpisode(),status:'empty'};
 try{const s=JSON.parse(raw);if(s?.version!==1)return {state:freshEpisode(),status:'incompatible'};
 if(typeof s.briefed!=='boolean')throw Error();
 if(s.completed!==null){const c=s.completed;if(!s.briefed||!c||!Number.isFinite(Date.parse(c.at))||!Number.isInteger(c.records)||c.records<2||c.records>200||!Number.isInteger(c.questions)||c.questions<1||c.questions>c.records||!['supported','uncertain'].every(k=>typeof c[k]==='string'&&c[k].length>=8&&c[k].length<=2400))throw Error();}
 return {state:s,status:'ok'};
 }catch{return {state:freshEpisode(),status:'corrupt'};}
}
export function stationInReach(p){
 return STATIONS.map(s=>{const dx=s.x-p.x,dz=s.z-p.z,dy=s.y-1.62,d=Math.hypot(dx,dz,dy);return {...s,d,dot:(dx*Math.sin(p.yaw)*Math.cos(p.pitch)-dz*Math.cos(p.yaw)*Math.cos(p.pitch)+dy*Math.sin(p.pitch))/d};})
 .filter(s=>s.d<1.55&&s.dot>.88).sort((a,b)=>a.d-b.d)[0]??null;
}
