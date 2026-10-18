// The centre prompt names what the crosshair is on, so the notebook, the 3D nameplate
// and the record field share one vocabulary instead of three.
export function aimLabel(aimed){
 if(!aimed)return '';
 if(aimed.station==='hmi')return 'HMI · E 다음 / Shift+E 이전 · F 확대 · R 현재 화면 기록';
 if(aimed.internal&&aimed.station==='mcc')return 'PM-103 '+String.fromCharCode(65+aimed.cabinet)+' 내부 · F 확대 · R 외관 기록 (가상 관찰)';
 if(aimed.door){
  // which way it is held changes what the person has to do, so the prompt says which
  if(aimed.door.stuck)return aimed.door.open
   ?'문이 막혀 끝까지 열리지 않습니다 · 문이 열릴 자리에서 한 걸음 물러나세요'
   :'문이 몸에 막혀 닫히지 않습니다 · 문 앞에서 한 걸음 물러나세요';
  return 'E · '+(aimed.door.open?'문 닫기':'문 열기')+'  |  F · 자세히 보기  |  R · 기록';
 }
 return (aimed.title?aimed.title+'  |  ':'')+'F · 자세히 보기  |  R · 관찰 기록';
}
