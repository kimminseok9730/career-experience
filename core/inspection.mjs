// Prompts are deliberately separate from the answer key. No answers before handover.
export const INSPECTION = {
 hmi:{prompt:'화면의 수위 숫자와 A/B/C 운전 표시를 읽고 적으세요.',fields:[['level','수위 (m)','number'],['b','B 펌프 표시',['RUN','STOP','TRIP']]]},
 mcc:{prompt:'제어반 전면의 POWER와 PM-103 B 표시를 대조하세요. E로 문을 열고 내부 표시도 살펴볼 수 있습니다.',fields:[['power','POWER 표시',['ON','OFF']],['b','B 제어반 표시',['RUN','STOP','TRIP']]]},
 ups:{prompt:'UPS 전면 표시를 읽으세요. UPS와 MCC가 같은 전원을 나타내는지 생각해 보세요.',fields:[['status','UPS 상태',['NORMAL','FAULT']]]},
 field:{prompt:'안전 통로에서 배관 연결부와 바닥을 살펴보고, 펌프 본체가 실제로 보이는지 구분하세요.',fields:[['leak','배관 주변에서 눈으로 확인한 누수',['보임','보이지 않음','확인 못함']],['pump','습정 안 펌프 본체',['직접 보임','직접 보이지 않음']]]},
};
export function validateReading(station,record){
 const schema=INSPECTION[station];if(!schema)throw new Error('관찰 대상이 아닙니다.');
 if(!record||typeof record.reason!=='string'||record.reason.trim().length<10||record.reason.length>1000)throw new Error('무엇을 보고 어떻게 판단했는지 10자 이상 적어주세요.');
 for(const [key,label,choices] of schema.fields){const value=record.values?.[key];
  if(choices==='number'){if(value===''||value===undefined||value===null||!Number.isFinite(Number(value))||Number(value)<0||Number(value)>12)throw new Error(label+'를 0~12 사이 숫자로 기록하세요.');}
  else if(!choices.includes(value))throw new Error(label+'를 선택하세요.');
 }
 return {values:Object.fromEntries(schema.fields.map(([key,,type])=>[key,type==='number'?String(Number(record.values[key])):record.values[key]])),reason:record.reason.trim()};
}
export function readingText(station,record){return INSPECTION[station].fields.map(([key,label])=>label+': '+record.values[key]).join(' / ')+'\n판단 근거: '+record.reason;}
export function expectedReadings(p){
 const b=({running:'RUN',stopped:'STOP',faulted:'TRIP',isolated:'STOP'})[p.pumps['PM-103-B']];
 return {hmi:{level:String(p.waterLevelM),b},mcc:{power:p.mccEnergized?'ON':'OFF',b},ups:{status:p.upsHealthy?'NORMAL':'FAULT'},field:{leak:'보이지 않음',pump:'직접 보이지 않음'}};
}
export function assessReadings(p,observations){
 const expected=expectedReadings(p),mismatches=[];
 for(const [id,schema] of Object.entries(INSPECTION))for(const [key,label,type] of schema.fields){const actual=observations[id]?.values?.[key],wanted=expected[id][key];if(type==='number'?Math.abs(Number(actual)-Number(wanted))>.05:actual!==wanted)mismatches.push(`${label}: 기록 ${actual??'없음'} / 설비 표시 ${wanted}`);}
 return mismatches;
}
