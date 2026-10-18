import { CASES, STATIONS, createRound, startRound, observe, evidenceFor, submitReport, restoreRound, plantFor } from './core/round.mjs';
import { INSPECTION } from './core/inspection.mjs';
import {createRecovery,recoveryAction,recordTrial,trialReadings,TRIAL_CHECKS,recoveryPlant} from './core/recovery.mjs';
import { CHECKS,PURPOSES,instrumentReading,saveDiagnosticReading,requestDiagnosticHandover,receiveFollowup,saveVisualObservation,voltageComparisonRows,saveVoltageComparison } from './core/diagnosis.mjs';
import {createPageTimer} from './core/page-timer.mjs';

const STORAGE = 'field-note.round.v5';
export function mountRound(world) {
  const $ = id => document.getElementById(id);
  let round = null, storageFailed = false, draft = {};
  try { round = restoreRound(JSON.parse(localStorage.getItem(STORAGE))); } catch { storageFailed = true; }
  round ??= createRound('fault','supply');
  world.setPlant(recoveryPlant(plantFor(round.caseId),round.recovery));
  const panel = $('panel'), body = $('panelBody');
  function persist() {
    try { localStorage.setItem(STORAGE, JSON.stringify(round)); storageFailed = false; } catch { storageFailed = true; }
    $('saveStatus').textContent = storageFailed ? '저장 공간을 사용할 수 없습니다. 종료 전 결과를 내려받으세요.' : '이 브라우저에 진행 상황이 저장됩니다.';
  }
  function open(title, kicker = 'FIELD NOTE') {
    world.pause();
    $('panelTitle').textContent = title;
    $('panelKicker').textContent = kicker;
    body.replaceChildren();
    if (!panel.open) panel.showModal();
  }
  function close() { panel.close(); world.focus(); }
  $('closePanel').onclick = close;
  body.addEventListener('click',e=>{const photo=e.target.closest?.('.evidence-photo');if(photo)photo.classList.toggle('zoomed');});
  panel.addEventListener('close', () => { world.pause(); world.focus(); });
  function paragraph(text, className = '') {
    const p = document.createElement('p'); p.textContent = text; p.className = className; return p;
  }
  function button(text, action, primary = false) {
    const b = document.createElement('button'); b.textContent = text; b.type = 'button'; if (primary) b.className = 'primary'; b.onclick = action; return b;
  }
  function actions(...buttons) { const div = document.createElement('div'); div.className = 'dialog-actions'; div.append(...buttons); body.append(div); }
  function paint() {
    world.setVariant?.(round.diagnosis?.variant);
    world.setRecovery?.(round.recovery);
    world.setPlant(recoveryPlant(plantFor(round.caseId),round.recovery));
    world.setWorkflow?.(round.diagnosis?.status,round.recovery?.stage);
    $('diagnosticNotebook').hidden=round.caseId!=='fault';
    $('diagnosticNotebook').disabled=round.phase!=='inspection';
    $('diagnosticNotebook').textContent=round.recovery?'복구·시험운전 · '+({review:'자료 검토',ready:'시험 준비',trial:'시험 중',stopped:'중지',verified:'인계 준비'}[round.recovery.stage]):'추가 확인 · '+({investigating:'근거 수집',returned:'보완 요청',accepted:'점검 접수',handedoff:'회신 도착'}[round.diagnosis?.status]??'');
    $('missionTitle').textContent = CASES[round.caseId].title;
    $('missionText').textContent = round.phase === 'complete' ? '점검을 마쳤습니다. 피드백을 확인하고 다음 회차에 도전하세요.' : '네 곳의 관찰 근거를 모아 이상 상태와 조치를 보고하세요.';
    const count = Object.keys(round.observations).length;
    $('progressCount').textContent = `${count} / 4`;
    $('progress').value = count;
    $('stations').replaceChildren();
    for (const [id, station] of Object.entries(STATIONS)) {
      const b = button(station.label, () => { world.goTo(id);$('mission').hidden=true;$('missionToggle').textContent='점검 수첩';$('missionToggle').setAttribute('aria-expanded','false'); });
      b.className = 'station' + (round.observations[id] ? ' done' : '');
      b.disabled = round.phase !== 'inspection';
      const mark = document.createElement('span'); mark.textContent = round.observations[id] ? '✓ 기록됨' : '안내 이동 →'; b.append(mark); $('stations').append(b);
    }
    $('reportButton').disabled = round.phase !== 'complete' && (round.phase !== 'inspection' || count !== 4);
    $('reportButton').textContent = round.phase === 'complete' ? '점검 결과 보기' : count === 4 ? (round.diagnosis&&round.diagnosis.status!=='handedoff'?'추가 확인·점검 요청으로 →':'점검 보고 작성 →') : '관찰 4곳을 기록하면 보고 가능';
  }
  function briefing() {
    open(CASES[round.caseId].title, 'WORK ORDER / 작업 지시');
    body.append(paragraph(CASES[round.caseId].brief, 'lead'));
    const paper = document.createElement('div'); paper.className = 'paper';
    paper.append(paragraph('오늘의 역할 · 전기안전관리자'), paragraph('업무 범위 · 외부 표시와 현장 외관의 관찰, 이상 판단, 담당자에게 인계'), paragraph('예상 시간 · 5~10분'));
    body.append(paper);
    const list = document.createElement('ol'); list.className = 'steps';
    for (const text of ['현장에서 HMI·제어반·UPS의 실제 표시를 읽습니다. F를 누르면 가까이 볼 수 있습니다.', 'E로 제어반 문을 열거나 닫습니다. R로 수첩을 열어 읽은 값과 판단 이유를 직접 남깁니다.', ...(round.diagnosis?['HMI와 MCC를 바라보고 Q로 추가 확인합니다. 사건 기록·전압·정지 직전 전류를 읽고 원인 후보에 맞는 전문 점검을 요청하세요.']:[]), '기록을 서로 대조한 뒤 보고합니다. 설비 표시와 내 기록의 비교는 보고 후 확인할 수 있습니다.']) {
      const li = document.createElement('li'); li.textContent = text; list.append(li);
    }
    body.append(list, paragraph('B반 문을 열고 상단 L1·L2·L3 접속부를 비교하세요. 내부를 바라보며 R을 누르면 외관 관찰과 사진을 기록합니다. 제어반은 실측 도면이 없는 교육용 재구성입니다. 실제 활선 설비 개방 절차를 재현한 것은 아닙니다.', 'muted'));
    actions(button(round.phase === 'briefing' ? '작업 지시 확인 · 점검 시작' : '현장으로 돌아가기', () => {
      round = startRound(round); persist(); paint(); close();
    }, true));
  }
  function notebook() {
    open('관찰 수첩', 'EVIDENCE / 확인한 사실');
    for (const [id, station] of Object.entries(STATIONS)) {
      const card = document.createElement('section'); card.className = 'paper';
      const title = document.createElement('h3'); title.textContent = station.label;
      card.append(title, paragraph(round.observations[id]?.text ?? '아직 관찰을 기록하지 않았습니다.'));
      if(round.observations[id]?.photo){const image=document.createElement('img');image.src=round.observations[id].photo;image.alt=station.label+' 기록 당시 시야';image.className='evidence-photo';card.append(image);}
      if (round.observations[id]) card.append(paragraph(new Date(round.observations[id].timestamp).toLocaleString('ko-KR'), 'muted'));
      body.append(card);
    }
    actions(button('현장으로 돌아가기', close));
  }
  function inspect(id) {
    if(round.recovery){recoveryPanel();return;}
    if (round.phase !== 'inspection' || !Object.hasOwn(STATIONS, id)) return;
    const photo=world.captureEvidence?.();
    open(STATIONS[id].label, 'OBSERVATION / 현장 관찰');
    body.append(paragraph(INSPECTION[id].prompt,'lead'));
    if(photo){const image=document.createElement('img');image.src=photo;image.alt='지금 바라본 설비 · 기록 사진';image.className='evidence-photo';body.append(image,paragraph('기록 당시 시야입니다. 확인할 부위가 보이지 않으면 현장으로 돌아가 다시 촬영하세요.','muted'));}
    const form=document.createElement('form'), previous=round.observations[id];
    for(const [key,title,choices] of INSPECTION[id].fields){
      const label=document.createElement('label');label.textContent=title;label.htmlFor='reading-'+key;
      const input=document.createElement(choices==='number'?'input':'select');input.id=label.htmlFor;input.name=key;input.required=true;
      if(choices==='number'){input.type='number';input.min='0';input.max='12';input.step='.1';}
      else{input.add(new Option('현장에서 읽은 표시 선택',''));for(const value of choices)input.add(new Option(value,value));}
      input.value=previous?.values[key]??'';form.append(label,input);
    }
    const label=document.createElement('label');label.textContent='무엇을 보고 왜 그렇게 판단했나요?';label.htmlFor='reading-reason';
    const reason=document.createElement('textarea');reason.id=label.htmlFor;reason.name='reason';reason.required=true;reason.minLength=10;reason.maxLength=1000;reason.value=previous?.reason??'';reason.placeholder='눈으로 확인한 위치·표시 / 다른 설비와 비교한 점 / 아직 확인하지 못한 것';
    const error=paragraph('','error');error.setAttribute('role','alert');
    const save=document.createElement('button');save.type='submit';save.textContent='내 관찰 기록 저장';save.className='primary';
    form.append(label,reason,error,save);form.onsubmit=e=>{e.preventDefault();try{const values=Object.fromEntries(new FormData(form));round=observe(round,id,{values,reason:values.reason,photo});persist();paint();close();}catch(e){error.textContent=e.message;}};
    body.append(form);actions(button('다시 설비 보기',close));
  }
  function updateDiagnosis(next){round={...round,diagnosis:next};persist();paint();world.setWorkflow?.(next.status);}
  function inspectInternal(cabinet){
    if(round.phase!=='inspection'||!round.diagnosis)return;
    if(round.diagnosis.status==='handedoff'){diagnosticNotebook();return;}
    const photo=world.captureEvidence?.();
    open('PM-103 '+String.fromCharCode(65+cabinet)+' · 내부 외관','VISUAL / 보이는 사실과 원인 추정 분리');
    body.append(paragraph('교육용 비접촉 관찰입니다. 실제 설비는 자격·작업허가·격리·무전압 확인 등 현장 절차 없이 열거나 만지면 안 됩니다. 이 장면은 그 절차를 수행한 것으로 인정하지 않습니다.','muted'));
    if(photo){const img=document.createElement('img');img.src=photo;img.alt='직접 바라본 내부 접속부';img.className='evidence-photo';body.append(img);}
    body.append(paragraph('상단 QF 위 L1·L2·L3의 피복과 접속부를 비교하세요. 변색·변형은 추가 조사가 필요한 징후이지, 원인을 확정하는 증거는 아닙니다. 외관상 차이가 없어도 정상 판정은 할 수 없습니다.','lead'));
    if(cabinet!==1){body.append(paragraph('비교용 A·C반입니다. B반의 관찰 기록은 B 문을 열고 내부를 바라보며 R로 남기세요.'));actions(button('현장으로 돌아가기',close));return;}
    const form=document.createElement('form'),previous=round.diagnosis.visual;
    for(const [name,title,options] of [
      ['location','차이를 관찰한 위치',[['L1','L1 접속부'],['L2','L2 접속부'],['L3','L3 접속부'],['none','세 곳을 비교했으나 뚜렷한 차이 없음'],['unseen','아직 충분히 보지 못함']]],
      ['appearance','눈으로 확인한 외관',[['damage','변색 또는 피복 변형·손상'],['clear','관찰 범위에서 뚜렷한 손상 없음'],['unseen','가려지거나 작아서 확인 불가']]],
      ['conclusion','현재 말할 수 있는 범위',[['suspect','열 영향 등 이상 징후 의심 · 원인은 추가 확인'],['unknown','외관만으로 정상·원인 판단 불가'],['normal','외관이 깨끗하므로 설비 정상 확정'],['confirmed','외관만으로 접속 불량 원인 확정']]]]){
      const label=document.createElement('label');label.htmlFor='visual-'+name;label.textContent=title;
      const select=document.createElement('select');select.id=label.htmlFor;select.name=name;select.required=true;select.add(new Option('내 관찰에 맞게 선택',''));for(const [v,t] of options)select.add(new Option(t,v));select.value=previous?.[name]??'';form.append(label,select);
    }
    const label=document.createElement('label');label.htmlFor='visual-note';label.textContent='비교한 부위·보이는 차이·추가로 확인할 것';
    const note=document.createElement('textarea');note.id=label.htmlFor;note.name='note';note.required=true;note.minLength=15;note.maxLength=1500;note.value=previous?.note??'';
    const error=paragraph('','error');error.setAttribute('role','alert');const save=document.createElement('button');save.type='submit';save.textContent='외관 관찰과 사진 저장';
    form.append(label,note,error,save);form.onsubmit=e=>{e.preventDefault();try{updateDiagnosis(saveVisualObservation(round.diagnosis,{...Object.fromEntries(new FormData(form)),photo}));diagnosticNotebook();}catch(e){error.textContent=e.message;}};
    body.append(form);actions(button('다시 부위 보기',close));
  }
  function diagnosticAt(station,selectedCheck=null){
    if(round.phase!=='inspection'||!round.diagnosis)return;
    if(round.diagnosis.status==='handedoff'){diagnosticNotebook();return;}
    const fieldPhoto=selectedCheck?world.captureEvidence?.():undefined;
    open('추가 확인 · '+STATIONS[station].label,'INSTRUMENT / 설치계기와 기록계');
    body.append(paragraph(fieldPhoto?'현장에서 확인한 화면을 근거로 기록합니다. 교육용 가상 데이터이며 활선 프로브 조작은 하지 않습니다.':'확인할 데이터와 계기 모드를 선택하세요. 계기는 교육용 가상 데이터이며 활선 프로브 조작은 하지 않습니다.','muted'));
    const label=document.createElement('label');label.textContent='확인 대상';label.htmlFor='diagnostic-target';
    const select=document.createElement('select');select.id=label.htmlFor;
    for(const [id,c] of Object.entries(CHECKS))if(c.station===station)select.add(new Option(c.label,id));
    if(selectedCheck&&CHECKS[selectedCheck]?.station===station)select.value=selectedCheck;
    if(!select.options.length){body.append(paragraph('이 지점에는 진단용 기록계가 없습니다. HMI에서 사건·전류 이력, MCC에서 현재 전압·전류를 확인할 수 있습니다.'));actions(button('현장으로 돌아가기',close));return;}
    const ml=document.createElement('label');ml.textContent='계기 모드';ml.htmlFor='diagnostic-mode';const mode=document.createElement('select');mode.id=ml.htmlFor;
    for(const [v,t] of [['voltage','V · 전압'],['current','A · 전류'],['events','EVENT · 사건·상태 기록']])mode.add(new Option(t,v));
    if(selectedCheck&&CHECKS[selectedCheck]?.station===station){mode.value=CHECKS[selectedCheck].mode;body.append(paragraph('현장 HMI에서 보던 항목을 선택했습니다. 값과 판단은 직접 기록하세요.','paper'));}
    const pl=document.createElement('label');pl.textContent='이번 확인에서 알아볼 것';pl.htmlFor='diagnostic-purpose';const purpose=document.createElement('select');purpose.id=pl.htmlFor;
    purpose.add(new Option('확인 목적 선택',''));for(const [id,text] of Object.entries(PURPOSES))purpose.add(new Option(text,id));
    const queryError=paragraph('','error');queryError.setAttribute('role','alert');
    body.append(pl,purpose);
    if(fieldPhoto)body.append(paragraph(CHECKS[selectedCheck].label,'eyebrow'));else body.append(label,select,ml,mode);
    body.append(queryError,button(fieldPhoto?'현장 사진을 보며 기록':'선택한 계기 조회',()=>{if(!purpose.value){queryError.textContent='먼저 무엇을 확인하려는지 선택하세요.';return;}queryError.textContent='';renderInstrument(select.value,mode.value,purpose.value);},true));
    const reading=document.createElement('div');body.append(reading);
    function renderInstrument(id,mode,purpose){
      const r=instrumentReading(round.diagnosis,id,mode);reading.replaceChildren();
      const device=document.createElement('section');device.className='instrument';device.setAttribute('aria-label',r.label);device.append(paragraph(r.label,'eyebrow'));
      r.values.forEach((v,i)=>{const row=document.createElement('div');row.className='meter-row';const caption=document.createElement('span');caption.textContent=r.channels[i];const value=document.createElement('strong');value.textContent=v+' '+(['시각','상태'].includes(r.unit)?'':r.unit);row.append(caption,value);device.append(row);});
      if(r.valid&&id==='current'){
        const chart=document.createElementNS('http://www.w3.org/2000/svg','svg');chart.setAttribute('viewBox','0 0 320 90');chart.setAttribute('role','img');chart.setAttribute('aria-label','정지 직전 세 상 전류와 정지 후 0 A · 교육용 추이');
        r.values.forEach((v,i)=>{const line=document.createElementNS(chart.namespaceURI,'polyline');const y=80-Number(v)*.5;line.setAttribute('points',`5,${y+15} 70,${y+9} 130,${y+3} 210,${y} 240,${y} 242,80 315,80`);line.setAttribute('fill','none');line.setAttribute('stroke',['#86d4ed','#f8c16e','#c0e697'][i]);line.setAttribute('stroke-width','2');chart.append(line);});device.append(chart,paragraph('−30초 → 보호 동작 → 현재 STOP · 곡선은 교육용 추세 도식','muted'));
      }
      reading.append(paragraph('조회 목적: '+PURPOSES[purpose],'eyebrow'));
      const captured=fieldPhoto&&selectedCheck===id&&r.valid;
      if(captured){const img=document.createElement('img');img.src=fieldPhoto;img.alt='직접 관찰한 HMI 화면 · '+r.label;img.className='evidence-photo';reading.append(img,paragraph('현장에서 보고 있던 화면입니다. 사진의 채널과 값을 직접 읽어 기록하세요. 확대가 부족하면 현장으로 돌아가 F로 확대한 뒤 다시 R을 누르세요.','muted'));}
      else reading.append(device);
      reading.append(paragraph(r.message,'muted'));if(!r.valid)return;
      const form=document.createElement('form');
      r.channels.forEach((channel,i)=>{const l=document.createElement('label');l.htmlFor='channel-'+i;l.textContent=channel+' · 읽은 값';const input=document.createElement('input');input.id=l.htmlFor;input.name='c'+i;input.required=true;input.type=['시각','상태'].includes(r.unit)?'text':'number';if(input.type==='number')input.step='any';input.value=captured?'':round.diagnosis.readings[id]?.values[i]??'';form.append(l,input);});
      const il=document.createElement('label');il.textContent='이 값이 말해주는 것은?';il.htmlFor='diagnostic-meaning';const meaning=document.createElement('select');meaning.name='meaning';meaning.id=il.htmlFor;meaning.required=true;
      for(const [v,t] of [['','해석 선택'],['normal','이 항목에서 뚜렷한 이상을 찾지 못함'],['abnormal','기준·상간 비교 또는 사건 기록에서 이상을 확인'],['insufficient','현재 값만으로 원인 판단 불가']])meaning.add(new Option(t,v));
      const error=paragraph('','error');error.setAttribute('role','alert');const save=document.createElement('button');save.type='submit';save.textContent='내가 읽은 값과 해석 기록';form.append(il,meaning,error,save);
      form.onsubmit=e=>{e.preventDefault();try{const data=new FormData(form);updateDiagnosis(saveDiagnosticReading(round.diagnosis,id,mode,[0,1,2].map(i=>data.get('c'+i)),data.get('meaning'),purpose,captured?fieldPhoto:undefined));diagnosticNotebook();}catch(e){error.textContent=e.message;}};
      reading.append(form);
    }
    actions(button('현장으로 돌아가기',close),button('추가 확인 수첩',diagnosticNotebook));
  }
  function diagnosticNotebook(){
    if(!round.diagnosis||round.phase!=='inspection')return;
    if(round.recovery){recoveryPanel();return;}
    const d=round.diagnosis;open('원인 후보와 후속 점검','DIAGNOSIS / 근거로 선택하는 다음 업무');
    body.append(paragraph(d.response,'paper'));
    const appearance={damage:'변색·손상 관찰',clear:'뚜렷한 손상 없음',unseen:'확인 불가'};
    const conclusions={suspect:'이상 징후 의심·원인 미확정',unknown:'외관만으로 판단 불가',normal:'정상 확정으로 기록함',confirmed:'원인 확정으로 기록함'};
    body.append(paragraph(d.visual?`B반 외관 / ${d.visual.location} / ${appearance[d.visual.appearance]} / ${conclusions[d.visual.conclusion]} / ${d.visual.note}`:'B반 외관 미기록: 문을 열고 상단 접속부를 비교한 뒤 내부를 바라보며 R을 누르세요.','paper'));
    if(d.visual?.photo){const img=document.createElement('img');img.src=d.visual.photo;img.alt='B반 외관 기록 사진';img.className='evidence-photo';body.append(img);}
    body.append(paragraph('기준 카드: 가상 명판 400 V · 70 A. 세 상 전압을 서로 비교하고 정지 직전 전류를 명판과 대조하세요. 현재 STOP 전류와 과거 운전 전류는 다릅니다. 전류 상승만으로 기계 고장을 확정하지 마세요.','muted'));
    for(const [id,r] of Object.entries(d.readings))body.append(paragraph(CHECKS[id].label+' / 목적: '+(PURPOSES[r.purpose]??'이전 기록·목적 미지정')+' / '+r.values.join(' · ')+' / '+({normal:'뚜렷한 이상 없음',abnormal:'이상 확인',insufficient:'판단 불가'}[r.interpretation]),'paper'));
    for(const [id,r] of Object.entries(d.readings))if(r.photo){const detail=document.createElement('details'),summary=document.createElement('summary'),img=document.createElement('img');summary.textContent=CHECKS[id].label+' · 현장 사진';img.src=r.photo;img.alt=summary.textContent;img.className='evidence-photo';detail.append(summary,img);body.append(detail);}
    if(d.comparison)body.append(paragraph('두 지점 비교 판단: '+({branch:'B 분기 구간 우선 확인',upstream:'상위 계통 고장으로 확정',unresolved:'범위 확정 보류'}[d.comparison.scope])+' / '+d.comparison.note,'paper'));
    if(d.status==='handedoff'){
      body.append(paragraph('B 펌프는 계속 정지 상태입니다. 원인 확인 회신만으로 수리·복구가 완료된 것은 아닙니다.'));
      const next=button(d.variant==='supply'?'복구 결과 검토로 진행':'최종 보고 작성',()=>{if(d.variant==='supply'){if(Object.keys(round.observations).length<4){body.append(paragraph('복구 전 초기 관찰 4곳을 먼저 기록하세요. 복구 후의 표시와 섞어 기록하지 않습니다.','error'));return;}round={...round,recovery:createRecovery({dynamic:true})};persist();paint();recoveryPanel();}else reportForm();},true);
      actions(button('현장으로 돌아가기',close),next);return;
    }
    if(d.status==='accepted'){actions(button('가상 전문 점검 회신 받기',()=>{updateDiagnosis(receiveFollowup(d));diagnosticNotebook();},true),button('현장으로 돌아가기',close));return;}
    const nav=document.createElement('div');nav.className='dialog-actions';for(const id of ['hmi','mcc'])nav.append(button(STATIONS[id].label+'로 이동',()=>{close();world.goTo(id);$('mission').hidden=true;$('missionToggle').textContent='점검 수첩';$('missionToggle').setAttribute('aria-expanded','false');}));nav.append(button('상위·분기 기록 나란히 비교',compareVoltage));body.append(nav);
    const form=document.createElement('form');
    for(const [name,title,options] of [['hypothesis','현재 가장 의심하는 원인 후보',[['load','부하 증가 가능성'],['supply','분기 전원 이상 가능성'],['unknown','범위를 좁혔지만 아직 판단 보류']]],['route','요청할 후속 업무',[['mechanical','기계 점검팀 · 부하 측 확인'],['electrical','전기 점검팀 · 분기 전원 확인'],['specialist','추가 진단팀 · 원인 판별 요청'],['restart','근거 보완 없이 재기동 요청']]]]){
      const l=document.createElement('label');l.htmlFor='decision-'+name;l.textContent=title;const s=document.createElement('select');s.id=l.htmlFor;s.name=name;s.required=true;s.add(new Option('선택하세요',''));for(const [v,t] of options)s.add(new Option(t,v));form.append(l,s);
    }
    form.append(paragraph('이번 판단에 실제로 사용한 근거를 선택하세요.'));
    for(const [id,r] of Object.entries(d.readings)){const l=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='evidence';input.value=id;l.append(input,document.createTextNode(' '+CHECKS[id].label));form.append(l);}
    const l=document.createElement('label');l.htmlFor='decision-note';l.textContent='이 점검을 요청하는 이유와 아직 확정하지 못한 것';const note=document.createElement('textarea');note.id=l.htmlFor;note.name='note';note.minLength=15;note.maxLength=1500;note.required=true;
    const error=paragraph('','error');error.setAttribute('role','alert');const submit=document.createElement('button');submit.type='submit';submit.textContent='근거를 첨부하여 점검 요청';form.append(l,note,error,submit);
    form.onsubmit=e=>{e.preventDefault();try{const data=new FormData(form);updateDiagnosis(requestDiagnosticHandover(d,{...Object.fromEntries(data),evidence:data.getAll('evidence')}));diagnosticNotebook();}catch(e){error.textContent=e.message;}};body.append(form);
    if(d.attempts.length){const log=document.createElement('details'),s=document.createElement('summary');s.textContent='이전 요청과 회신 '+d.attempts.length+'건';log.append(s);for(const a of d.attempts)log.append(paragraph(a.note+' → '+a.response));body.append(log);}
  }
  function compareVoltage(){
    const d=round.diagnosis;open('상위 전원과 B 분기 비교','COMPARE / 09:41:59 · 정지 직전');
    body.append(paragraph('상위 모선 → B 입력 접속부 → 분기 기록계 → KM → 모터','paper'),paragraph('같은 시각·운전 조건의 기록입니다. 아래 그래프는 내가 입력한 값이며, 정답값으로 자동 보정하지 않습니다. 0~500 V 공통 눈금, 실제 배선도가 아닌 측정 위치 안내입니다.','muted'));
    const rows=voltageComparisonRows(d);
    if(!rows.length){body.append(paragraph('HMI에서 상위 모선과 B 분기의 정지 직전 전압을 각각 조회하고 기록하세요. 조회하지 않은 값은 표시하지 않습니다.'));}
    else{
      const table=document.createElement('table');table.style.width='100%';table.setAttribute('aria-label','내 기록 전압 비교');
      const header=document.createElement('tr');for(const text of ['선간','상위 모선','B 분기']){const th=document.createElement('th');th.scope='col';th.textContent=text;header.append(th);}table.append(header);
      for(const r of rows){const row=document.createElement('tr'),name=document.createElement('th');name.scope='row';name.textContent=r.channel;row.append(name);
        for(const [key,title] of [['upstream','상위'],['branch','분기']]){const cell=document.createElement('td'),bar=document.createElement('meter');bar.min=0;bar.max=500;bar.value=Number.isFinite(r[key])?r[key]:0;bar.style.width='100%';bar.setAttribute('aria-label',title+' '+r.channel);cell.append(document.createTextNode(Number.isFinite(r[key])?r[key]+' V':'입력 확인 필요'),bar);row.append(cell);}table.append(row);
      }body.append(table,paragraph('전압 차이는 추가 점검 범위를 좁히는 근거입니다. 이 비교만으로 손상 부품·접촉저항·원인을 확정하거나 재기동하지 않습니다.','muted'));
      const form=document.createElement('form'),label=document.createElement('label'),scope=document.createElement('select');label.htmlFor='comparison-scope';label.textContent='이 비교로 좁힐 수 있는 범위';scope.id=label.htmlFor;scope.required=true;
      for(const [id,text] of [['','판단 선택'],['branch','B 분기 구간을 우선 확인 · 부품 원인 미확정'],['upstream','상위 계통 고장으로 확정'],['unresolved','두 기록만으로 범위 확정 보류']])scope.add(new Option(text,id));scope.value=d.comparison?.scope??'';
      const nl=document.createElement('label'),note=document.createElement('textarea');nl.htmlFor='comparison-note';nl.textContent='비교한 값과 아직 알 수 없는 것';note.id=nl.htmlFor;note.required=true;note.minLength=15;note.maxLength=1500;note.value=d.comparison?.note??'';
      const error=paragraph('','error');error.setAttribute('role','alert');const save=document.createElement('button');save.type='submit';save.textContent='비교 판단 기록';form.append(label,scope,nl,note,error,save);
      form.onsubmit=e=>{e.preventDefault();try{updateDiagnosis(saveVoltageComparison(d,scope.value,note.value));diagnosticNotebook();}catch(e){error.textContent=e.message;}};body.append(form);
    }
    actions(button('추가 확인 수첩',diagnosticNotebook));
  }
  function updateRecovery(next){round={...round,recovery:next};persist();paint();}
  function recoveryPanel(){
    const r=round.recovery;if(!r)return;
    open('복구 검토와 시험운전','RESTORATION / 전문팀·운전 담당자와 인계');
    body.append(paragraph(r.feedback,'paper'),paragraph('플레이어는 검토·관찰 담당입니다. 보수와 시험 조작은 가상 전문팀·운전 담당자가 수행합니다. 실제 작업 승인이나 안전 절차를 대신하지 않습니다.','muted'));
    if(r.dynamic)body.append(paragraph('교육용 시험 T+'+r.elapsed+'초 · 현장 화면에서 1초씩 진행 · 수첩/기록창/다른 탭에서는 일시정지. 실제 설비 응답 시간이나 보호 설정값이 아닙니다.','muted'));
    const completed=r.stage!=='review';
    body.append(paragraph('가상 작업 회신 · B 분기 접속부','eyebrow'));
    for(const line of completed?[r.dynamic&&!r.resolved?'외관 손상 부위 보수: 완료 회신 · 부하 조건 전체 경로는 미검증':'접속부 교체 및 관련 전문 점검: 완료 회신','작업책임자 인원·공구 철수, 작업 종료: 확인 회신',r.stage==='stopped'?'운전 담당자 시험 승인: 중지로 종료 · 재승인 필요':'운전 담당자 시험 승인: 접수','실제 현장 문 닫힘: 시험 요청 시 모델에서 별도 확인']:['접속부 손상: 전문팀 확인','보수 작업 종료: 미회신','인원·공구 철수 및 운전 인계: 미확인','시험 승인: 없음'])body.append(paragraph(line));
    const error=paragraph('','error');error.setAttribute('role','alert');body.append(error);
    const act=(action,options={})=>{try{updateRecovery(recoveryAction(round.recovery,action,options));recoveryPanel();}catch(e){error.textContent=e.message;}};
    const go=id=>{close();world.goTo(id);$('mission').hidden=true;$('missionToggle').textContent='점검 수첩';$('missionToggle').setAttribute('aria-expanded','false');};
    if(r.stage==='review')actions(button('자료 미확인 상태로 시험 요청',()=>act('trial',{enclosuresClosed:world.enclosuresClosed?.()})),button('작업 종료·시험 승인 회신 요청',()=>act('request-handback'),true));
    if(['ready','stopped'].includes(r.stage))actions(button('MCC 문 확인하러 이동',()=>go('mcc')),button('운전 담당자에게 시험 요청',()=>act('trial',{enclosuresClosed:world.enclosuresClosed?.()}),true));
    if(r.stage==='stopped'){
      const label=document.createElement('label'),note=document.createElement('textarea');label.textContent='중지 사유·재시험 전 확인 요청';note.maxLength=2000;label.append(note);body.append(label);
      if(r.dynamic){
        if(Object.keys(r.previousRecords).length)body.append(paragraph('최근 기록을 남긴 시험의 근거 · 새 기록 없이 중지한 시험은 이 근거를 지우지 않습니다. 아래 시간은 해당 기록을 남긴 시험 기준입니다.','muted'));
        for(const [id,rec] of Object.entries(r.previousRecords))body.append(paragraph('보관된 시험 근거 T+'+rec.elapsed+'초 · '+TRIAL_CHECKS[id].title+' · '+rec.values.join(' / ')));
        body.append(paragraph('위 메모에 근거와 추가 확인 이유를 적고 점검 범위를 선택하세요. 점검 요청만으로 이상이 해소됐다고 판단하지 않습니다.'));
        actions(button('전기팀 · B 분기 전원 경로 추가 점검',()=>act('inspect-electrical',{note:note.value})),button('기계팀 · 펌프 부하 측 추가 점검',()=>act('inspect-mechanical',{note:note.value})));
      }
      actions(button('중지 원인·재시험 조건 확인 요청',()=>act('request-retrial',{note:note.value}),true));
    }
    if(r.stage==='trial'){
      body.append(paragraph('HMI에서 E로 시험 페이지를 넘기고 R로 세 값을 기록하세요. '+(r.dynamic?'초기값만으로 판단하지 말고 30초 이후 부하 조건의 변화도 비교하세요. 인계는 추가 점검 후 재시험 60초 이상 관찰 기록이 필요합니다. 추세 화면은 E로 확인합니다.':'T+60초 기록은 교육용 압축 재생입니다.')+' 전압 명판 400 V·전류 70 A, 이번 가상 시험 계획의 토출 기준은 유량 3.0~3.4 m³/min·압력 0.30~0.40 MPa·재발 경보 0건입니다. 실제 설비 기준이 아닙니다.','paper'));
      if(r.dynamic)actions(button('교육용 시험 시간 15초 진행',()=>act('advance',{seconds:15})));
      for(const [id,c] of Object.entries(TRIAL_CHECKS))body.append(paragraph(c.title+': '+(r.records[id]?r.records[id].values.join(' / ')+' · '+({acceptable:'이번 시험 기준 내',stop:'이상 의심 · 중지 요청 필요',unknown:'확인 부족'}[r.records[id].meaning]):'미기록')));
      actions(button('시험 중지 요청',()=>act('stop')),button('HMI 시험 기록 확인',()=>go('hmi'),true));
      const form=document.createElement('form'),label=document.createElement('label'),note=document.createElement('textarea');label.htmlFor='trial-handover';label.textContent='시험 결과·전문팀 회신·미확인 범위 인계 메모';note.id=label.htmlFor;note.minLength=20;note.maxLength=2000;note.required=true;
      const save=document.createElement('button');save.type='submit';save.textContent='시험 결과 검토 후 인계 준비';form.append(label,note,save);form.onsubmit=e=>{e.preventDefault();act('accept',{note:note.value});};body.append(form);
    }
    if(r.stage==='verified'){body.append(paragraph(r.note,'paper'));actions(button('최종 인계 보고 작성',reportForm,true));}
    if(r.log.length){const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent='복구 업무 이력 '+r.log.filter(i=>i.action!=='advance').length+'건';detail.append(summary);for(const item of r.log.filter(i=>i.action!=='advance'))detail.append(paragraph(({trial:'시험 요청',stop:'시험 중지',hold:'보류','request-handback':'전문팀 작업 종료 회신 요청','request-retrial':'중지 사유·재시험 조건 검토 요청','inspect-electrical':'전기팀 추가 점검','inspect-mechanical':'기계팀 추가 점검',record:'시험 값 기록',accept:'인계 검토'}[item.action])+ (item.id?' · '+TRIAL_CHECKS[item.id].title:'')+(item.elapsed!==undefined?' · T+'+item.elapsed+'초':'')+(item.values?' · '+item.values.join(' / '):'')+(item.note?' · '+item.note:'')));body.append(detail);}
    actions(button('현장으로 돌아가기',close));
  }
  function recordTrialAt(id){
    if(round.phase!=='inspection'||round.recovery?.stage!=='trial'){recoveryPanel();return;}
    const c=trialReadings(round.recovery,id),photo=world.captureEvidence?.();open(c.title+' 기록','TRIAL / 현장 설치계기 관찰');
    if(round.recovery.dynamic)body.append(paragraph('T+'+round.recovery.elapsed+'초 관찰 · 입력 중 시험 시간 정지','paper'));
    if(photo){const img=document.createElement('img');img.src=photo;img.alt='시험 중 HMI 화면';img.className='evidence-photo';body.append(img);}
    body.append(paragraph('시험 화면에서 읽은 값을 직접 기록하세요. 값이 불안정하거나 이상하면 복구 수첩에서 시험 중지를 요청합니다.','muted'));
    const form=document.createElement('form');c.channels.forEach((channel,i)=>{const label=document.createElement('label'),input=document.createElement('input');label.htmlFor='trial-'+i;label.textContent=channel+' ('+c.units[i]+')';input.id=label.htmlFor;input.name='c'+i;input.type='number';input.step='any';input.required=true;form.append(label,input);});
    const label=document.createElement('label'),meaning=document.createElement('select');label.htmlFor='trial-meaning';label.textContent='이 기록에 대한 판단';meaning.id=label.htmlFor;meaning.required=true;
    for(const [id,text] of [['','선택하세요'],['acceptable','이번 가상 시험 계획의 기준 내'],['stop','이상 의심 · 중지 요청 필요'],['unknown','기준 또는 상태 확인 부족']])meaning.add(new Option(text,id));
    const error=paragraph('','error'),save=document.createElement('button');error.setAttribute('role','alert');save.type='submit';save.textContent='시험 관찰 기록';form.append(label,meaning,error,save);form.onsubmit=e=>{e.preventDefault();try{const data=new FormData(form);updateRecovery(recordTrial(round.recovery,id,[0,1,2].map(i=>data.get('c'+i)),meaning.value));recoveryPanel();}catch(e){error.textContent=e.message;}};body.append(form);actions(button('현장으로 돌아가기',close));
  }
  function reportForm() {
    if (round.phase === 'complete') { result(); return; }
    if(round.diagnosis&&round.diagnosis.status!=='handedoff'){diagnosticNotebook();return;}
    if((round.recoveryRequired||round.recovery)&&round.recovery?.stage!=='verified'){diagnosticNotebook();return;}
    open('점검 보고 작성', 'HANDOVER / 관찰에서 판단으로');
    body.append(paragraph('네 곳의 근거를 바탕으로 보고하세요. 경보의 원인까지 확인했는지, 표시 상태만 확인했는지 구분하는 것이 중요합니다.', 'lead'));
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = '기록한 관찰 4건 펼치기'; details.append(summary);
    for (const [id, entry] of Object.entries(round.observations)) details.append(paragraph(`${STATIONS[id].label}: ${entry.text}`, 'muted'));
    body.append(details);
    if(round.diagnosis?.visual)body.append(paragraph('내가 확인한 B반 외관','eyebrow'),paragraph(round.diagnosis.visual.note,'paper'));
    if(round.diagnosis)body.append(paragraph('전문 점검 회신','eyebrow'),paragraph(round.diagnosis.response,'paper'));
    if(round.recovery)body.append(paragraph('초기 이상과 복구 후 상태를 구분해 보고하세요. 아래 선택 항목은 초기 점검 당시의 상태입니다.','paper'),paragraph('복구·시험 확인: '+round.recovery.note,'paper'));
    const form = document.createElement('form');
    const grid = document.createElement('div'); grid.className = 'form-grid'; form.append(grid);
    const fields = [
      ['diagnosis', '이상 상태 판단', [['pump','B 펌프 고장 표시'],['power','MCC 동력 전원 상실'],['water','수위가 경보 기준 초과'],['normal','이상 없음']]],
      ['risk', '우선 보고할 위험', [['capacity','배수 능력 저하 가능성'],['stopped','전체 펌프 정지'],['overflow','수위 상승에 따른 넘침'],['none','특이 위험 없음']]],
      ['action', '다음 조치', [['report','담당자 보고·승인된 후속 점검 요청'],['restart','원인 확인 전 임의 재기동'],['enter','습정에 들어가 직접 확인']]],
      ['certainty', '내가 직접 확인한 범위', [['unconfirmed','표시·외관·계기 기록 확인 (전문팀 회신은 별도 출처)'],['confirmed','내가 내부 고장 원인과 습정 무인까지 직접 확인']]],
    ];
    for (const [name, label, options] of fields) {
      const div = document.createElement('div'), l = document.createElement('label'), select = document.createElement('select');
      l.htmlFor = `report-${name}`; l.textContent = label; select.id = l.htmlFor; select.name = name; select.required = true;
      select.add(new Option('선택하세요', ''));
      for (const [value, text] of options) select.add(new Option(text, value));
      select.value = draft[name] ?? ''; div.append(l, select); grid.append(div);
    }
    const label = document.createElement('label'); label.htmlFor = 'report-note'; label.textContent = '인계 메모 (20~2,000자)';
    const note = document.createElement('textarea'); note.id = label.htmlFor; note.name = 'note'; note.required = true; note.minLength = 20; note.maxLength = 2000; note.value = draft.note ?? ''; note.placeholder = '확인한 사실 / 미확인 사항 / 누구에게 무엇을 요청할지';
    const error = paragraph('', 'error'); error.id = 'formError'; error.setAttribute('role', 'alert');
    const submit = document.createElement('button'); submit.type = 'submit'; submit.className = 'primary'; submit.textContent = '보고 제출 · 결과 확인';
    form.append(label, note, paragraph('점수는 선택 항목과 관찰 완료 여부로 계산합니다. 인계 메모의 내용은 자동 채점하지 않으며 결과에 그대로 보존합니다.', 'muted'), error, submit);
    form.oninput = () => { draft = Object.fromEntries(new FormData(form)); };
    form.onsubmit = event => {
      event.preventDefault();
      try { round = submitReport(round, Object.fromEntries(new FormData(form))); persist(); paint(); result(); } catch (e) { error.textContent = e.message; }
    };
    body.append(form);
  }
  function download() {
    const diagnostic=round.diagnosis?['추가 확인 기록','B반 외관: '+JSON.stringify(round.diagnosis.visual?{...round.diagnosis.visual,photo:undefined}:null),...Object.entries(round.diagnosis.readings).map(([id,r])=>`${CHECKS[id].label}: ${r.values.join(' / ')} (${r.interpretation})`),...round.diagnosis.attempts.map(a=>`${a.hypothesis} / ${a.route}: ${a.note}\n회신: ${a.response}`),round.diagnosis.response]:[];
    if(round.diagnosis?.comparison)diagnostic.push('09:41:59 상위·분기 비교: '+JSON.stringify(round.diagnosis.comparison));
    if(round.recovery)diagnostic.push('복구·시험운전 이력 (가상 전문팀/운전 담당자 수행)',JSON.stringify(round.recovery,null,2));
    if(round.diagnosis)for(const [id,r] of Object.entries(round.diagnosis.readings))diagnostic.push(CHECKS[id].label+' / 확인 목적: '+(PURPOSES[r.purpose]??'이전 기록·미지정')+' / '+(CHECKS[id].context??'계기 항목 표기 시점'));
    const text = [CASES[round.caseId].title, `완료: ${round.result.completedAt}`, `점수: ${round.result.score}/100`, '', '관찰 근거', ...Object.entries(round.observations).map(([id, e]) => `${STATIONS[id].label}: ${e.text}`), ...diagnostic, '', '인계 메모', round.report.note, '', '피드백', ...round.result.checks.map(c => `${c.ok ? '충족' : '보완'} · ${c.label}: ${c.feedback}`)].join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + text], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = `현장노트-${round.caseId}.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function result() {
    open(round.result.passed ? '점검을 마쳤습니다' : '다음 점검에서 보완해 보세요', 'DEBRIEF / 결과 피드백');
    if(round.diagnosis)body.append(paragraph(round.diagnosis.response,'paper'));
    if(round.recovery)body.append(paragraph('복구 후 확인: '+round.recovery.note,'paper'));
    const score = document.createElement('div'); score.className = 'score'; score.textContent = String(round.result.score); const unit = document.createElement('small'); unit.textContent = ' / 100'; score.append(unit); body.append(score);
    for (const c of round.result.checks) {
      const div = document.createElement('div'); div.className = 'check' + (c.ok ? '' : ' fail');
      const title = document.createElement('strong'); title.textContent = `${c.ok ? '✓' : '△'} ${c.label} · ${c.ok ? c.points : 0}/${c.points}`;
      div.append(title, paragraph(c.feedback)); body.append(div);
    }
    body.append(paragraph('내가 남긴 인계 메모', 'eyebrow'), paragraph(round.report.note, 'paper note'), paragraph('선택형 학습 피드백입니다. 실제 직무 수행 자격이나 현장 작업 승인을 의미하지 않습니다.', 'muted'));
    actions(button('보고서 내려받기', download), button('다른 회차 선택', chooseCase, true));
  }
  function chooseCase() {
    open('다음 순회점검', 'NEXT ASSIGNMENT');
    body.append(paragraph('회차를 시작하면 현재 수첩이 새 점검으로 바뀝니다. 이전 보고서는 결과 화면에서 내려받을 수 있습니다.', 'muted'));
    const list = document.createElement('div'); list.className = 'case-list';
    for (const [id, c] of Object.entries(CASES)) list.append(button(c.title, () => {
      round = createRound(id,Math.random()<.5?'load':'supply'); draft = {}; world.setPlant(plantFor(id)); world.reset(); persist(); paint(); briefing();
    }));
    body.append(list); actions(button('결과로 돌아가기', result));
  }
  $('reportButton').onclick = reportForm;
  $('diagnosticNotebook').onclick=diagnosticNotebook;
  $('notebookButton').onclick = notebook;
  $('assignmentButton').onclick = briefing;
  $('missionToggle').onclick=()=>{const hidden=$('mission').hidden=!$('mission').hidden;$('missionToggle').textContent=hidden?'점검 수첩':'수첩 접기';$('missionToggle').setAttribute('aria-expanded',String(!hidden));};
  $('referenceButton').onclick=()=>{open('표시를 읽는 기준','REFERENCE / 점검 참고');body.append(paragraph('RUN: 운전 상태 신호 · STOP: 정지 상태 신호 · TRIP: 보호장치 동작 상태 신호. TRIP만으로 기계 고장이나 배선 결함의 원인을 확정할 수 없습니다.'),paragraph('POWER는 해당 제어반의 전원 표시입니다. UPS NORMAL은 제어용 예비전원의 상태이며, MCC 동력 전원이 있다는 뜻은 아닙니다.'),paragraph('이 회차의 고수위 경보 기준은 8.0 m입니다. 현재 수위는 HMI에서 직접 읽고 운전 표시와 비교하세요.'),paragraph('문 안쪽에서 보이는 QF·KM·단자대·보호접지선은 구조를 이해하기 위한 재구성입니다. 보이지 않는 펌프 본체와 실제 내부 고장 원인은 확인하지 못한 것으로 기록하세요.'));actions(button('현장으로 돌아가기',close));};
  paint(); persist();
  createPageTimer(()=>{
    const r=round.recovery;
    if(round.phase!=='inspection'||!r?.dynamic||r.stage!=='trial'||panel.open||document.hidden||r.elapsed>=120)return;
    round={...round,recovery:recoveryAction(r,'advance',{seconds:1})};persist();
    world.setRecovery?.(round.recovery);world.setPlant(recoveryPlant(plantFor(round.caseId),round.recovery));
    if(round.recovery.stage!=='trial'){paint();recoveryPanel();}
  });
  if (round.phase === 'complete') result(); else briefing();
  return { inspect,inspectInternal,diagnosticAt,recordTrialAt,canDiagnose:()=>round.phase==='inspection'&&round.caseId==='fault', canInspect: () => round.phase === 'inspection' };
}
