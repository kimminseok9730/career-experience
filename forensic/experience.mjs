import {EPISODE_KEY,freshEpisode,restoreEpisode,nextTask,finishEpisode,STATIONS} from '../core/forensic-episode.mjs';
import {KEY,EXAMS,fresh,restore,request,receive,interpret} from '../core/forensic-consult.mjs';
import {SOURCES,OBSERVATIONS,QUESTIONS,progress} from '../core/forensic-observation.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
export function createExperience({getObservation,getScene,enterHeart,notify,practice=false}){
 let episode=freshEpisode(),consult=fresh(),episodeWritable=!practice,consultWritable=!practice,drafts={};
 if(!practice)try{
  const a=restoreEpisode(localStorage.getItem(EPISODE_KEY)),b=restore(localStorage.getItem(KEY));episode=a.state;consult=b.state;
  episodeWritable=['empty','ok'].includes(a.status);consultWritable=['empty','ok'].includes(b.status);
 }catch{episodeWritable=consultWritable=false;}
 const dialog=$('workstationDialog'),content=$('workstationContent');
 function save(){
  if(episodeWritable)try{localStorage.setItem(EPISODE_KEY,JSON.stringify(episode));}catch{episodeWritable=false;}
  if(consultWritable)try{localStorage.setItem(KEY,JSON.stringify(consult));}catch{consultWritable=false;}
  refresh();
 }
 function refresh(){
  const task=nextTask(episode,getObservation(),consult);
  $('missionTitle').textContent=task.title;$('missionDetail').textContent=task.detail;
  $('missionNumber').textContent=task.index===4?'COMPLETE':`STEP ${task.index+1} / 4`;
  $('missionSteps').innerHTML=['사건 확인','관찰·기록','감정 회신','업무 인계'].map((x,i)=>`<li class="${i<task.index?'done':i===task.index?'current':''}"><span>${i<task.index?'✓':i+1}</span>${x}</li>`).join('');
  $('episodeSave').textContent=practice?'연습 모드 · 저장하지 않음':episodeWritable&&consultWritable?'진행 자동 저장':'임시 진행 · 기록 내보내기 필요';
  $('workSaveStatus').textContent=$('episodeSave').textContent;
  getScene()?.setObjective(task.station);return task;
 }
 function open(title){
  $('workstationTitle').textContent=title;getScene()?.pause(true);if(document.pointerLockElement)document.exitPointerLock();
  if(!dialog.open)dialog.showModal();requestAnimationFrame(()=>{dialog.scrollTop=0;});
 }
 function close(){dialog.close();}
 dialog.addEventListener('close',()=>{getScene()?.pause(false);getScene()?.focus();refresh();});
 $('closeWorkstation').onclick=close;
 $('exportEpisode').onclick=()=>{
  const blob=new Blob([JSON.stringify({episode,observations:getObservation(),consult,notice:'가상 사건의 심장 관찰 업무 기록. 최종 사인 감정서 아님.'},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='FM-01-observation-handoff.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 function briefing(){
  const task=refresh();
  if(['handoff','complete'].includes(task.id)){handoff();return;}
  open('사건 파일 · FM–01');
  content.innerHTML=`<div class="work-kicker">CASE BRIEFING / 관찰 업무 배정</div><h3>야간 근무 중 발견된 사망</h3><p class="work-lead">당신은 심장 관찰 기록을 맡은 법의관입니다. 관찰한 사실과 아직 알 수 없는 점을 구분해 다음 담당자에게 인계하세요.</p><div class="brief-grid"><article><span>의뢰 요약</span><h4>52세 · 시설관리 근무자</h4><p>야간 근무 중 의식을 잃은 상태로 발견되었습니다. 발견 상황과 기존 병력만으로 사인을 정할 수는 없습니다.</p></article><article><span>이번 업무</span><h4>관찰 → 질문 → 확인</h4><p>심장의 표면과 관상동맥·심근 단면을 살펴보고, 기록에 연결한 질문을 전문감정 단말기로 가져가세요.</p></article></div><div class="work-note">이 방의 심장은 HRA 해부학 자료의 심장 하나로 만든 교육용 모형입니다. 가상 사건의 실제 검체가 아니며, 조직의 색·형태와 감정 회신은 교육용으로 재구성한 자료입니다.</div><div class="work-route"><span>01 사건 파일</span><i>→</i><span>02 심장 작업대</span><i>→</i><span>03 뒤쪽 단말기</span></div><button id="acceptAssignment" class="primary">${episode.briefed?'확인 · 공간으로 돌아가기':'업무 확인 · 심장 작업대로'}</button>`;
  $('acceptAssignment').onclick=()=>{episode={...episode,briefed:true};save();close();notify('심장 작업대에 다가가 E를 누르세요.');};
 }
 function handoff(){
  open('업무 인계 · 관찰 기록');const obs=getObservation(),summary=episode.completed??consult.reflection;
  content.innerHTML=`<div class="work-kicker">${episode.completed?'HANDOFF SAVED':'READY TO HAND OFF'}</div><h3>${episode.completed?'관찰 업무를 마쳤습니다.':'관찰과 해석을 인계하세요.'}</h3><div class="handoff-metrics"><div><b>${episode.completed?.records??obs.records.length}</b><span>관찰 기록</span></div><div><b>${episode.completed?.questions??obs.questions.length}</b><span>연결 질문</span></div><div><b>${consult.requests.length}</b><span>감정 의뢰</span></div></div><article class="work-card"><h4>회신이 지지하는 내용</h4><p>${esc(summary?.supported)}</p></article><article class="work-card"><h4>남아 있는 의문 · 다음 담당자에게</h4><p>${esc(summary?.uncertain)}</p></article><div class="work-note">완료 범위는 심장 관찰과 전문감정 회신 해석입니다. 전신 부검 완료나 최종 사인 확정을 뜻하지 않습니다.</div>${episode.completed?'<button id="finishHandoff" class="primary">부검실로 돌아가기</button>':'<button id="finishHandoff" class="primary">이 내용으로 업무 인계 저장</button>'}`;
  $('finishHandoff').onclick=()=>{if(!episode.completed){try{episode=finishEpisode(episode,obs,consult);save();handoff();notify('관찰 업무 인계를 저장했습니다.');}catch(e){notify(e.message);}}else close();};
 }
 function terminal(){
  open('감정 단말기 · FM–01');const obs=getObservation();
  if(!episode.briefed||!progress(obs).complete){
   content.innerHTML=`<div class="work-kicker">REQUEST NOT READY</div><h3>관찰 근거를 먼저 준비하세요.</h3><p class="work-lead">${esc(refresh().detail)}</p><p>다섯 관찰 화면을 확인하고, 혈관·내부 기록과 연결 질문을 남기면 의뢰할 수 있습니다.</p><button id="terminalBack" class="primary">공간으로 돌아가기</button>`;$('terminalBack').onclick=close;return;
  }
  if(!consult.received){
   content.innerHTML=`<div class="work-kicker">SPECIALIST REQUEST / 01</div><h3>관찰에서 생긴 질문을 의뢰합니다.</h3><p class="work-lead">의뢰할 분야를 등록한 뒤 가상 회신을 확인하세요.</p><form id="roomRequest"><label for="rqKind">감정 분야</label><select id="rqKind" name="kind">${Object.entries(EXAMS).map(([k,v])=>`<option value="${k}" ${consult.requests.some(r=>r.kind===k)?'disabled':''}>${v.title}</option>`).join('')}</select><label for="rqRecord">질문에 연결된 관찰 기록</label><select id="rqRecord" name="record">${obs.questions.map(q=>{const r=obs.records.find(r=>r.id===q.recordId);return `<option value="${esc(r.id)}">${esc(SOURCES[r.sourceKey].title)} · ${esc(QUESTIONS[q.question])}</option>`;}).join('')}</select><label for="rqPurpose">이 검사로 확인하려는 점</label><textarea id="rqPurpose" name="purpose" minlength="8" maxlength="1200" required placeholder="관찰만으로 알 수 없었던 점을 적어 주세요.">${esc(drafts.purpose)}</textarea><button class="primary" ${consult.requests.length===2?'disabled':''}>감정 의뢰 등록</button></form><div class="request-chips">${consult.requests.map(r=>`<span>✓ ${EXAMS[r.kind].title} 접수</span>`).join('')}</div>${consult.requests.length?'<div class="work-note">교육용 시간 이동: 실제 검사 기간을 생략하고, 의뢰한 분야의 가상 회신을 엽니다.</div><button id="roomReceive" class="primary">다음 근무일 · 회신 확인</button>':''}`;
   $('roomRequest').oninput=()=>drafts.purpose=$('rqPurpose').value;
   $('roomRequest').onsubmit=e=>{e.preventDefault();try{
    const data=new FormData(e.target),r=obs.records.find(r=>r.id===data.get('record')),q=obs.questions.find(q=>q.recordId===r.id);
    consult=request(consult,{kind:data.get('kind'),question:QUESTIONS[q.question],purpose:data.get('purpose'),evidence:`${r.id} · ${SOURCES[r.sourceKey].title} · 모형 v${r.modelVersion}\n${OBSERVATIONS[r.observation]}\n${r.note}`});drafts.purpose='';save();terminal();
   }catch(e){notify(e.message);}};
   if($('roomReceive'))$('roomReceive').onclick=()=>{consult=receive(consult);save();terminal();};return;
  }
  content.innerHTML=`<div class="work-kicker">SIMULATED REPORTS / 02</div><h3>회신이 말해 주는 범위를 읽으세요.</h3><p class="work-lead">실제 검사가 아닌, 미리 작성된 가상 사건의 회신입니다.</p>${consult.requests.map(r=>{const x=EXAMS[r.kind];return `<article class="work-card"><span>${x.id} · ${x.title}</span><p>${x.result}</p><div class="work-note">${x.limit}</div></article>`;}).join('')}<form id="roomReflection"><label for="rrSupported">회신이 지지하는 내용</label><textarea id="rrSupported" name="supported" minlength="8" maxlength="1200" required>${esc(drafts.supported??consult.reflection?.supported)}</textarea><label for="rrUncertain">아직 확정할 수 없는 내용</label><textarea id="rrUncertain" name="uncertain" minlength="8" maxlength="1200" required>${esc(drafts.uncertain??consult.reflection?.uncertain)}</textarea><button class="primary">해석 저장 · 사건 파일로 인계</button></form>`;
  $('roomReflection').oninput=()=>{drafts.supported=$('rrSupported').value;drafts.uncertain=$('rrUncertain').value;};
  $('roomReflection').onsubmit=e=>{e.preventDefault();try{consult=interpret(consult,Object.fromEntries(new FormData(e.target)));save();close();notify('오른쪽 벽의 사건 파일로 돌아가 업무를 인계하세요.');}catch(e){notify(e.message);}};
 }
 function interact(id){
  if(id==='briefing')briefing();
  if(id==='heart'){if(!episode.briefed){briefing();return;}enterHeart();}
  if(id==='terminal')terminal();
 }
 function navigation(p){
  const task=nextTask(episode,getObservation(),consult),target=STATIONS.find(s=>s.id===task.station);
  const distance=Math.hypot(target.x-p.x,target.z-p.z),angle=Math.atan2(target.x-p.x,-(target.z-p.z))-p.yaw;
  $('wayfinderArrow').style.transform=`rotate(${angle*180/Math.PI}deg)`;
  $('wayfinderText').textContent=`${target.title} · ${distance.toFixed(1)} m`;
  const x=20+(p.x+3.7)/7.4*140,y=15+(p.z+3.7)/8.2*155;
  $('mapPlayer').setAttribute('transform',`translate(${x} ${y}) rotate(${p.yaw*180/Math.PI})`);
  for(const s of STATIONS)$('map-'+s.id).classList.toggle('target',s.id===task.station);
 }
 refresh();return {refresh,interact,navigation};
}
