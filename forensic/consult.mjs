import {KEY,EXAMS,fresh,request,receive,interpret,restore} from '../core/forensic-consult.mjs';
import {STORAGE_KEY,restore as restoreObservations,SOURCES,QUESTIONS,OBSERVATIONS} from '../core/forensic-observation.mjs';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const practice=new URLSearchParams(location.search).get('practice')==='1';
let state=fresh(),evidence=[],writable=!practice,stage=0;
try{
 if(!practice){const saved=restore(localStorage.getItem(KEY));state=saved.state;writable=['ok','empty'].includes(saved.status);
 const obs=restoreObservations(localStorage.getItem(STORAGE_KEY));
 evidence=obs.state.questions.map(q=>{const r=obs.state.records.find(r=>r.id===q.recordId);return `${r.id} · ${SOURCES[r.sourceKey].title} (모형 v${r.modelVersion??'이전'})\n관찰: ${OBSERVATIONS[r.observation]}\n관찰 메모: ${r.note||'별도 메모 없음'}\n질문: ${QUESTIONS[q.question]}`;});
 }else evidence=['연습 기록 · 심근 단면\n관찰 메모: 일부 색의 차이가 보이지만 성격은 알 수 없다.\n질문: 이 부위의 조직 변화는 어떤 성격일까?'];
}catch{writable=false;}
if(state.received)stage=state.reflection?2:1;
const drafts={};let lastStage=-1;
function feedback(message){$('message').textContent=message;$('message').hidden=false;setTimeout(()=>$('message').hidden=true,5000);}
function save(next){state=next;if(writable)try{localStorage.setItem(KEY,JSON.stringify(state));}catch{writable=false;}render();}
function render(){
 if(stage!==lastStage){lastStage=stage;requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));}
 $('saveStatus').textContent=practice?'연습 모드 · 새로고침하면 초기화':writable?'이 기기에 자동 저장':'저장 불가 · 기존 자료 보존 / 내보내기 가능';
 $('steps').innerHTML=['감정 의뢰 작성','회신 읽기','근거와 한계 정리'].map((x,i)=>`<button data-step="${i}" class="${stage===i?'active':''}" ${i>0&&!state.received?'disabled':''}>0${i+1} ${x}</button>`).join('');
 $('steps').querySelectorAll('button').forEach(b=>b.onclick=()=>{stage=Number(b.dataset.step);render();});
 $('register').innerHTML=state.requests.length?state.requests.map(r=>`<details open><summary>${esc(EXAMS[r.kind].title)} · ${state.received?'회신 도착':'의뢰 접수'}</summary><p>${esc(r.question)}</p><p>목적: ${esc(r.purpose)}</p><p>근거: ${esc(r.evidence)}</p></details>`).join(''):'<p class="muted">아직 의뢰한 감정이 없습니다.</p>';
 if(stage===0){
 $('screen').innerHTML=`<h2>무엇을 확인하기 위한 검사인가요?</h2><p class="intro">관찰 기록에 남긴 질문을 근거로 연결하세요. 의뢰할 분야를 모두 등록한 뒤 회신을 확인합니다.</p>${!evidence.length?'<div class="callout">관찰실에서 기록을 저장하고 연결 질문을 남겨 주세요. <a href="forensic.html">관찰실 열기 →</a></div>':''}<form id="requestForm" class="paper"><span class="eyebrow">EXAMINATION REQUEST</span><label for="kind">감정 분야</label><select id="kind" name="kind">${Object.entries(EXAMS).map(([k,v])=>`<option value="${k}" ${state.requests.some(r=>r.kind===k)?'disabled':''}>${v.title}</option>`).join('')}</select><label for="evidence">연결할 관찰 기록</label><select id="evidence" name="evidence">${evidence.map(e=>`<option value="${esc(e)}">${esc(e)}</option>`).join('')}</select><label for="question">해결하고 싶은 질문</label><textarea id="question" name="question" minlength="8" maxlength="1200" required placeholder="관찰만으로 알 수 없었던 점을 적어 주세요."></textarea><label for="purpose">검사 목적 · 판단에 기여할 점</label><textarea id="purpose" name="purpose" minlength="8" maxlength="1200" required placeholder="어떤 가능성을 검토하는 데 도움이 될까요?"></textarea><button class="primary" ${!evidence.length||state.received||state.requests.length===2?'disabled':''}>감정 의뢰 등록</button></form>${state.requests.length&&!state.received?'<div class="callout">교육용 시간 이동: 실제 검사 기간을 생략하고, 의뢰한 분야의 가상 회신을 엽니다. 회신 이후 의뢰서는 수정할 수 없습니다.</div><button id="receive" class="primary">다음 근무일 · 회신 확인 →</button>':''}`;
 bindDraft('requestForm');$('requestForm').onsubmit=e=>{e.preventDefault();try{const next=request(state,Object.fromEntries(new FormData(e.target)));delete drafts.requestForm;save(next);feedback('의뢰서를 등록했습니다.');}catch(err){feedback(err.message);}};
 if($('receive'))$('receive').onclick=()=>{stage=1;save(receive(state));};
 }else if(stage===1){
 $('screen').innerHTML=`<h2>도착한 회신을 읽어 보세요.</h2><p class="intro">가상 사건 자료 · 실제 검사나 모형 분석을 수행한 결과가 아닙니다.</p>${state.requests.map(r=>{const x=EXAMS[r.kind];return `<article class="paper"><span class="eyebrow">${x.id} / SIMULATED REPORT</span><h3>${x.title}</h3><p>${x.result}</p><div class="callout">해석의 한계<br>${x.limit}</div><details><summary>내가 의뢰한 질문</summary><p>${esc(r.question)}</p></details></article>`;}).join('')}<button id="reflect" class="primary">근거와 한계 정리하기 →</button>`;
 $('reflect').onclick=()=>{stage=2;render();};
 }else{
 $('screen').innerHTML=`<h2>알게 된 것과, 아직 모르는 것.</h2><p class="intro">회신 내용을 그대로 사인으로 바꾸지 않고, 지지하는 소견과 남은 질문을 나누어 기록합니다.</p><form id="reflectionForm" class="paper"><label for="supported">회신이 지지하는 내용</label><textarea id="supported" name="supported" required minlength="8" maxlength="1200">${esc(state.reflection?.supported)}</textarea><label for="uncertain">아직 확정할 수 없는 내용 · 추가 대조 자료</label><textarea id="uncertain" name="uncertain" required minlength="8" maxlength="1200">${esc(state.reflection?.uncertain)}</textarea><button class="primary">회신 해석 저장</button></form>${state.reflection?'<div class="callout"><strong>전문감정 구간의 기록을 저장했습니다.</strong><br>심장 관찰과 의뢰·회신 해석까지 진행했습니다. 전체 장기 검사, 증거 종합표와 최종 보고서는 후속 제작 범위입니다.</div><a class="secondary" href="case.html">사건 업무실로 돌아가기</a>':''}`;
 bindDraft('reflectionForm');$('reflectionForm').onsubmit=e=>{e.preventDefault();try{save(interpret(state,Object.fromEntries(new FormData(e.target))));feedback('회신 해석을 저장했습니다.');}catch(err){feedback(err.message);}};
 }
}
function bindDraft(id){const form=$(id);for(const el of form.elements){if(el.name&&drafts[id]?.[el.name]!==undefined)el.value=drafts[id][el.name];}form.oninput=()=>drafts[id]=Object.fromEntries(new FormData(form));}
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='FM-CASE-01-consult.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
render();
