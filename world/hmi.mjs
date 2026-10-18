import {CHECKS,instrumentReading} from '../core/diagnosis.mjs';
import {trialReadings} from '../core/recovery.mjs';
import {trialSample} from '../core/trial-model.mjs';

const pages=[null,'upstreamHistory','branchHistory','control','events','current'];
export function hmiView(plant,variant,index=0,recovery=null){
 if(recovery?.dynamic&&recovery.stage==='stopped'){const view=hmiView(plant,null,0);return {...view,context:'시험 중지 T+'+recovery.elapsed+'초 · 이전 근거는 복구 수첩에서 확인'};}
 if(['trial','verified'].includes(recovery?.stage)){
  const pageCount=recovery.dynamic?5:4,page=((index%pageCount)+pageCount)%pageCount,id=[null,'voltage','current','process'][page];
  const context=recovery.dynamic?'시험 T+'+recovery.elapsed+'초 · 교육용 모델 · 기록창에서 시간 정지':'시험 T+60초 · 교육용 압축 재생 · 운전 담당자 수행';
  if(page===4){
   const times=[0];for(let t=30;t<recovery.elapsed;t+=30)times.push(t);if(recovery.elapsed>0)times.push(recovery.elapsed);
   const rows=[['L2–L3 전압','voltage',1,'V'],['L2 전류','current',1,'A'],['B 분기 유량','process',0,'m³/min']].map(([label,id,i,unit])=>{const series=times.map(t=>trialSample(t,recovery.resolved)[id][i]);return {label,series,value:series.at(-1)+' '+unit};});
   return {page,pageCount,check:null,title:'시험 추세 · 시작 → 현재',context,rows,note:'각 선은 자체 범위로 표시 · 실제 수치는 개별 화면에서 기록'};
  }
  if(id){const r=trialReadings(recovery,id);return {page,pageCount,check:null,trialCheck:id,title:r.title,context,rows:r.channels.map((label,i)=>({label,value:r.values[i]+' '+r.units[i]})),note:'복구 후 시험 기록 · 초기 고장 이력과 구분'};}
  const view=hmiView(plant,null,0);return {...view,pageCount,context:recovery.dynamic?context:view.context+' · 시험운전'};
 }
 const enabled=plant.alarm==='pump-fault'&&['load','supply'].includes(variant);
 const pageCount=enabled?pages.length:1,page=((index%pageCount)+pageCount)%pageCount,check=pages[page];
 if(check){
  const reading=instrumentReading({variant},check,CHECKS[check].mode);
  return {page,pageCount,check,title:reading.label,context:reading.context??(check==='current'?'09:41:30–09:41:59 · 정지 직전 기록':check==='events'?'09:41:55–09:42:01 · 사건 기록':'현재 · 장치 보조접점 피드백'),rows:reading.channels.map((label,i)=>({label,value:String(reading.values[i])+(['V','A'].includes(reading.unit)?' '+reading.unit:'')})),note:check==='current'?'가상 명판 70 A · 현재 전류 아님':check==='control'?'ON ≠ 운전 · 무전압 검증 아님':'교육용 저장 기록 · 실측값 아님'};
 }
 const alarm=({none:'정상','high-water':'고수위 경보','pump-fault':'B 펌프 고장','power-loss':'MCC 전원 상실'})[plant.alarm];
 return {page,pageCount,check:null,title:'중계펌프장 운전감시',context:'현재 · MCC '+(plant.mccEnergized?'ON':'OFF')+' · UPS '+(plant.upsHealthy?'NORMAL':'FAULT'),rows:['A','B','C'].map(k=>({label:'PM-103 '+k,value:({running:'RUN',stopped:'STOP',faulted:'TRIP',isolated:'ISOLATED'})[plant.pumps['PM-103-'+k]]})),note:alarm+' · 수위 '+plant.waterLevelM.toFixed(1)+' m / 경보 기준 '+plant.trainingThresholds.highWaterM.toFixed(1)+' m'};
}

export function drawHmi(canvas,view){
 const c=canvas.getContext('2d');c.fillStyle='#10232d';c.fillRect(0,0,1024,640);
 c.textAlign='left';c.textBaseline='middle';
 c.fillStyle='#b5d6db';c.font='26px Malgun Gothic';c.fillText('FIELD HMI  /  '+(view.page+1)+' OF '+view.pageCount,40,35);
 c.fillStyle='#fff';c.font='bold 40px Malgun Gothic';c.fillText(view.title,40,88,944);
 c.fillStyle='#b8cbd1';c.font='23px Malgun Gothic';c.fillText(view.context,40,140,944);
 view.rows.forEach((row,i)=>{
  const y=195+i*97;c.fillStyle=i%2?'#1b3542':'#16303b';c.fillRect(32,y,960,82);
  c.fillStyle='#c2dbe0';c.font='29px Malgun Gothic';c.textAlign='left';c.fillText(row.label,55,y+41,370);
  if(row.series){const lo=Math.min(...row.series),span=Math.max(1,Math.max(...row.series)-lo);c.strokeStyle='#e5c276';c.lineWidth=3;c.beginPath();row.series.forEach((v,j)=>{const x=385+j*210/Math.max(1,row.series.length-1),py=y+64-(v-lo)/span*46;j?c.lineTo(x,py):c.moveTo(x,py);});c.stroke();}
  c.fillStyle=row.value==='TRIP'?'#ffbb83':'#e1f8dc';c.font='bold 43px Malgun Gothic';c.textAlign='right';c.fillText(row.value,961,y+41,550);
 });
 c.textAlign='left';c.fillStyle='#c5d3cb';c.font='25px Malgun Gothic';c.fillText(view.note,40,522,944);
 c.fillStyle='#284d56';c.fillRect(32,558,960,60);c.fillStyle='#fff';c.font='26px Malgun Gothic';
 c.fillText(view.pageCount>1?'E 다음 화면   /   Shift+E 이전   /   R 기록':'R 관찰 기록   /   F 확대',54,588,915);
}
