import {CASE_KEY,KINDS,HYPOTHESES,DOCUMENTS,fresh,transition,ready,restoreCase} from '../core/forensic-case.mjs';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const practice=new URLSearchParams(location.search).get('practice')==='1';
let stored,writeAllowed=true;
try{stored=restoreCase(practice?null:localStorage.getItem(CASE_KEY));}catch{stored={state:fresh(),status:'unavailable'};writeAllowed=false;}
if(['corrupt','incompatible'].includes(stored.status))writeAllowed=false;
let state=stored.state,stage=state.accepted?1:0,selected='D02',timer,lastStage=-1;
const drafts={};
const stages=['의뢰 확인','자료 검토','잠정 가설','관찰실 인계'];
const unlocked=i=>i===0||(state.accepted&&(i===1||(i===2&&Object.keys(state.notes).length>0)||(i===3&&ready(state))));
function message(text){$('message').textContent=text;$('message').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('message').hidden=true,6000);}
function save(){
 if(practice){$('saveStatus').textContent='연습 모드 · 새로고침하면 초기화';return;}
 try{if(!writeAllowed)throw Error();localStorage.setItem(CASE_KEY,JSON.stringify(state));$('saveStatus').textContent='저장됨 · 이 브라우저';}
 catch{$('saveStatus').textContent='기기에 저장 안 됨 · 기록 파일로 보관하세요';}
}
function act(action){try{state=transition(state,action);save();return true;}catch(e){message(e.message);return false;}}
function optionSet(entries,value){return Object.entries(entries).map(([id,label])=>`<option value="${id}" ${id===value?'selected':''}>${label}</option>`).join('');}
function render(){
 const stageChanged=lastStage!==stage;lastStage=stage;
 $('phase').textContent=`${String(stage+1).padStart(2,'0')} / ${stages[stage]}`;
 $('steps').innerHTML=stages.map((name,i)=>`<button data-stage="${i}" class="${i===stage?'active':''}" ${unlocked(i)?'':'disabled'} ${i===stage?'aria-current="step"':''}>0${i+1}　${name}</button>`).join('');
 $('count').textContent=`${Object.keys(state.notes).length} / 6`;$('progress').value=Object.keys(state.notes).length;
 $('notes').innerHTML=Object.entries(state.notes).map(([id,n])=>`<details><summary>${id} · ${esc(DOCUMENTS.find(d=>d.id===id).title)}</summary><p>${esc(n.note)}</p><small>${KINDS[n.kind]}</small></details>`).join('')||'<p class="muted">기록한 사실이 여기에 모입니다.<br>자료를 열고 첫 기록을 남겨 보세요.</p>';
 const screen=$('screen');
 if(stage===0){screen.innerHTML=`<h2>오늘의 감정 의뢰가 도착했습니다.</h2><p class="intro">당신은 이 사건을 맡은 법의관입니다. 먼저 의뢰사항과 현재 알려진 범위를 확인하세요.</p><article class="paper"><span class="eyebrow">REQUEST FOR EXAMINATION</span><h3>법의학 감정의뢰서</h3><dl><dt>사건 번호</dt><dd>FM-CASE-01</dd><dt>대상</dt><dd>김○○ · 남성 · 52세 · 시설관리 업무</dd><dt>의뢰사항</dt><dd>사망원인에 대한 법의학적 감정</dd><dt>접수 요약</dt><dd>야간 근무 중 휴게공간 인근에서 반응이 없는 상태로 발견됨. 주변 의자와 개인물품이 흐트러져 있으며, 구체적 사망 경위는 조사 중임.</dd></dl><div class="callout">지금은 사인이 정해지지 않았습니다. 현장 상황과 진술을 검토하고, 무엇을 추가로 확인할지 결정하세요.</div></article><div class="actions"><button class="primary" id="accept">${state.accepted?'자료 검토 이어가기':'의뢰사항 확인 · 사건 접수'} →</button></div><p class="muted">교육용 가상 사건입니다. 실제 기관의 내부 업무 화면이나 절차를 복제하지 않았습니다.</p>`;
 $('accept').onclick=()=>{if(act({type:'accept'})){stage=1;openDoc('D02');}};
 }
 if(stage===1){
 const d=DOCUMENTS.find(d=>d.id===selected),locked=d.id==='D09'&&!state.request,n=drafts[d.id]??state.notes[d.id]??{};
 screen.innerHTML=`<h2>이 정보는 어디에서 왔을까요?</h2><p class="intro">자료에서 확인한 사실을 직접 기록하세요. 진술과 기록, 검사 소견을 구분하는 것부터 시작합니다.</p><div class="doc-list">${DOCUMENTS.map(v=>`<button data-doc="${v.id}" class="${v.id===selected?'active':''}">${v.id} · ${v.title}<small>${state.notes[v.id]?'✓ 기록됨':v.id==='D09'&&!state.request?'보완 요청 필요':state.read.includes(v.id)?'열어봄 · 기록 필요':'미확인'}</small></button>`).join('')}</div>${locked?'':`<article class="paper"><span class="tag">${d.id} / ${d.source}</span><h3>${d.title}</h3><ul>${d.facts.map(f=>`<li>${f}</li>`).join('')}</ul><div class="callout">생각할 질문 · ${d.question}</div><form id="noteForm" data-draft="${d.id}"><label for="kind">정보 상태</label><select id="kind" name="kind" required><option value="">출처를 보고 구분하세요</option>${optionSet(KINDS,n.kind)}</select><label for="fact">자료에서 확인한 사실</label><textarea id="fact" name="note" maxlength="1200" required placeholder="내 추측을 더하지 않고, 자료가 말하는 사실을 적어 보세요.">${esc(n.note)}</textarea><button class="primary">${state.notes[d.id]?'기록 수정':'사실 기록'} ＋</button></form></article>`}<article class="paper"><span class="eyebrow">REQUEST ADDITIONAL RECORDS</span><h3>${state.request?'보완자료 회신 완료':'최근 의무기록이 부족합니다.'}</h3><p>동료가 전한 병력과 최근 진료 내용을 확인하기 위해 의료기관에 추가 기록을 요청할 수 있습니다.</p>${state.request?`<p><b>내 요청 이유</b><br>${esc(state.request.reason)}</p><p class="muted">이 체험에서는 요청 후 회신을 즉시 제공합니다. 실제 처리 시간을 재현하지 않습니다.</p><button class="secondary" data-doc="D09">D09 추가 회신 열기 →</button>`:`<form id="requestForm" data-draft="request"><label for="reason">어떤 질문을 해결하려고 요청하나요?</label><textarea id="reason" name="reason" maxlength="1200" required placeholder="최근 수개월 외래기록에서 확인하고 싶은 내용을 적으세요.">${esc(drafts.request?.reason)}</textarea><button class="primary">최근 의무기록 보완 요청 →</button></form>`}</article><div class="actions"><button class="primary" id="toHypothesis" ${Object.keys(state.notes).length?'':'disabled'}>잠정 가설 정리 →</button></div>`;
 screen.querySelectorAll('[data-doc]').forEach(b=>b.onclick=()=>openDoc(b.dataset.doc));
 if($('noteForm'))$('noteForm').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));if(act({type:'record',id:d.id,...data})){render();message('사실 기록을 저장했습니다. 이 기록만으로 사인을 확정하지 않습니다.');}};
 if($('requestForm'))$('requestForm').onsubmit=e=>{e.preventDefault();if(act({type:'request',reason:new FormData(e.target).get('reason')})){openDoc('D09');message('추가 의료자료가 도착했습니다. D09의 사실을 기록하세요.');}};
 $('toHypothesis').onclick=()=>{stage=2;render();};
 }
 if(stage===2){
 const h=drafts.hypothesis??state.hypothesis??{primary:'',alternative:'',evidence:[],reason:''};
 screen.innerHTML=`<h2>가능성을 열어 두고, 근거를 연결하세요.</h2><p class="intro">최종 사인 선택이 아닙니다. 우선 검토할 설명과 놓치지 않을 다른 가능성을 함께 남기세요.</p><form id="hypothesisForm" data-draft="hypothesis" class="paper"><label for="primary">우선 검토할 가설</label><select name="primary" id="primary" required><option value="">선택하세요</option>${optionSet(HYPOTHESES,h.primary)}</select><label for="alternative">아직 확인이 필요한 다른 가능성</label><select name="alternative" id="alternative" required><option value="">선택하세요</option>${optionSet(HYPOTHESES,h.alternative)}</select><fieldset class="checks"><legend>이 판단에 연결할 기록</legend>${Object.keys(state.notes).map(id=>`<label><input type="checkbox" name="evidence" value="${id}" ${h.evidence.includes(id)?'checked':''}>${id} · ${DOCUMENTS.find(d=>d.id===id).title}</label>`).join('')}</fieldset><label for="hypothesisReason">왜 그렇게 생각하며, 무엇이 아직 미확인인가요?</label><textarea id="hypothesisReason" name="reason" required maxlength="1200">${esc(h.reason)}</textarea><button class="primary">잠정 가설 저장</button><p class="muted">현재 단계에서는 특정 가설을 골랐다는 이유만으로 정답 처리하지 않습니다.</p></form><div class="callout">${ready(state)?'접수·6개 자료 기록·보완 요청·잠정 가설이 준비됐습니다. 관찰 계획을 확인하세요.':`아직 남은 일: ${DOCUMENTS.filter(d=>!state.notes[d.id]).map(d=>d.id+' 기록').concat(state.hypothesis?[]:['잠정 가설 저장']).join(', ')}`}</div><div class="actions"><button class="secondary" data-go="1">자료 검토로 돌아가기</button><button class="primary" id="handoff" ${ready(state)?'':'disabled'}>관찰 계획 확인 →</button></div>`;
 $('hypothesisForm').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target);if(act({type:'hypothesis',primary:data.get('primary'),alternative:data.get('alternative'),evidence:data.getAll('evidence'),reason:data.get('reason')})){render();message('잠정 가설을 저장했습니다. 이후 자료에 따라 수정할 수 있습니다.');}};
 $('handoff').onclick=()=>{stage=3;render();};
 }
 if(stage===3){const h=state.hypothesis;
 screen.innerHTML=`<span class="tag">첫 업무 구간 완료</span><h2>관찰실로 가져갈 질문이 생겼습니다.</h2><p class="intro">사건 접수를 마쳤습니다. 아직 사인을 결정할 단계는 아닙니다.</p><article class="paper"><span class="eyebrow">YOUR WORKING DIFFERENTIAL</span><h3>${HYPOTHESES[h.primary]}</h3><p>함께 확인할 가능성 · ${HYPOTHESES[h.alternative]}</p><p>${esc(h.reason)}</p><p class="muted">연결한 근거 · ${h.evidence.join(' · ')}</p></article><div class="timeline"><p><b>지금</b> 접수 · 자료 보완 · 잠정 가설 기록</p><p><b>체험</b> 3D 관찰실에서 관찰 사실과 남은 질문 기록</p><p><b>체험</b> 전문감정 의뢰 · 가상 회신 · 해석 기록</p><p><b>후속</b> PMCT·전신 부검·최종 감정서 구간 제작 예정</p></div><div class="callout">현재 관찰실은 심장 관찰 연습 구간입니다. 전신 부검을 완료한 것으로 처리하지 않습니다. 해부 모델의 형태와 가상 사건의 병변 근거도 구분해서 다룹니다.</div><div class="actions"><a class="primary" href="forensic.html?from=case">3D 관찰실로 이동 ↗</a><button class="secondary" data-go="2">가설 다시 검토</button></div>`;
 }
 document.querySelectorAll('[data-stage],[data-go]').forEach(b=>b.onclick=()=>{const next=Number(b.dataset.stage??b.dataset.go);if(unlocked(next)){stage=next;render();}});
 screen.querySelectorAll('form[data-draft]').forEach(form=>form.oninput=()=>{const f=new FormData(form),value=Object.fromEntries(f);if(form.dataset.draft==='hypothesis')value.evidence=f.getAll('evidence');drafts[form.dataset.draft]=value;});
 if(stageChanged)requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
}
function openDoc(id){selected=id;if(id!=='D09'||state.request)act({type:'read',id});render();}
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({...state,notice:'가상 사례의 접수·검토 연습 기록. 실제 감정서 아님.'},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='FM-CASE-01-intake.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
render();
if(!writeAllowed)$('saveStatus').textContent='기존 저장을 읽지 못함 · 덮어쓰지 않습니다. 파일로 보관하세요';
else $('saveStatus').textContent=practice?'연습 모드 · 기기에 저장하지 않음':stored.status==='ok'?'이전 사건 기록 복원됨':'기록하면 자동 저장됩니다';
if(state.accepted&&!state.read.includes(selected))openDoc(selected);
