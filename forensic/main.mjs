import {createExperience} from './experience.mjs';
import {recordView,createState,visit,addRecord,addQuestion,progress,restore,SOURCES,OBSERVATIONS,INTERPRETATIONS,QUESTIONS,STORAGE_KEY,MODEL_VERSION} from '../core/forensic-observation.mjs';
import {createScene} from './scene.mjs';
import {persistObservation} from './interaction.mjs';
const $=id=>document.getElementById(id);
const practice=new URLSearchParams(location.search).get('practice')==='1';
let experience=null,saved,writeAllowed=true;
try{saved=practice?{state:createState(),status:'empty'}:restore(localStorage.getItem(STORAGE_KEY));}catch{saved={state:createState(),status:'unavailable'};writeAllowed=false;}
let state=saved.state,source=null,scene=null,sceneReady=false,compare=false,markMode=false,toastTimer,review=null;
const drafts=new Map();
if(['corrupt','incompatible'].includes(saved.status))writeAllowed=false;
function notify(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3800);}
function persist(){
 if(practice){$('saveStatus').textContent='연습 모드 · 저장하지 않음';return true;}
 let result;
 try{result=persistObservation(state,localStorage,writeAllowed);}catch{result={ok:false};}
 $('storageWarning').hidden=result.ok;
 if(result.ok){$('saveStatus').textContent='저장됨 · 이 브라우저';}
 else{
  $('saveStatus').textContent='기기 저장 안 됨 · 파일로 보관 필요';
  $('storageWarning').textContent='지금 기록은 이 화면에만 남아 있어요. 새로고침하면 사라집니다. 상단 「기록」에서 「기록 파일로 저장」을 눌러 보관해 주세요. 기존 저장 내용은 덮어쓰지 않습니다.';
 }
 return result.ok;
}
function draft(key){if(!drafts.has(key))drafts.set(key,{observation:'',interpretation:'pending',note:'',mark:null,view:{yaw:0,pitch:0,zoom:1}});return drafts.get(key);}
function captureDraft(){
 if(!source||review)return;const d=draft(source);
 d.observation=$('recordForm').querySelector('input[name=observation]:checked')?.value??'';
 d.interpretation=$('interpretation').value;d.note=$('observationMemo').value;
 if(scene)d.view=scene.getView();
}
function syncMark(){const m=source?(review??draft(source)).mark:null;$('markStatus').textContent=m?'관찰 위치 표시됨':'위치 표시 없음';$('clearMark').hidden=!m||!!review;}
function renderDraft(){
 const d=review??draft(source);
 for(const radio of document.querySelectorAll('input[name=observation]'))radio.checked=radio.value===d.observation;
 $('interpretation').value=d.interpretation;$('observationMemo').value=d.note;
 $('formMessage').textContent=review?.legacy?'이전 모형에서 작성한 기록입니다. 내용은 보존했으며, 달라진 모형에 옛 위치 표시를 옮기지 않았습니다.':review?'저장 당시의 기록을 확인하고 있어요. 작성 중이던 메모는 따로 보존됩니다.':'';syncMark();
 $('endReview').hidden=!review;
 document.querySelectorAll('input[name=observation],#interpretation,#saveRecord,#markButton,#centerMarkButton').forEach(el=>el.disabled=!!review||!sceneReady);
 $('observationMemo').readOnly=!!review;
 scene?.setView(d.view);scene?.setMark(d.mark);
}
function updateProgress(){
 const p=progress(state);
 $('viewCount').textContent=p.views+' / 5';$('viewProgress').value=p.views;$('recordCount').textContent=state.records.length;
 document.querySelector('[data-check=surface]').textContent=state.visited.includes('surface')?'✓':'○';
 document.querySelector('[data-check=artery]').textContent=['artery-1','artery-2','artery-3'].every(k=>state.visited.includes(k))?'✓':'○';
 document.querySelector('[data-check=muscle]').textContent=state.visited.includes('muscle')?'✓':'○';
 $('nextQuestion').hidden=!state.records.length;$('completion').hidden=!p.complete;
 const previous=$('questionRecord').value;$('questionRecord').replaceChildren();
 for(const r of state.records){const o=document.createElement('option');o.value=r.id;o.textContent=r.id.slice(1).padStart(2,'0')+' · '+SOURCES[r.sourceKey].title;$('questionRecord').append(o);}
 if(state.records.some(r=>r.id===previous))$('questionRecord').value=previous;
 else if(state.records.length)$('questionRecord').value=state.records.at(-1).id;
 syncQuestion();experience?.refresh();
}
function syncQuestion(){
 const q=state.questions.find(q=>q.recordId===$('questionRecord').value);
 if(q)$('questionType').value=q.question;
 $('questionStatus').textContent=q?'관찰 기록에 질문이 연결되었습니다.':'';
}
function selectSource(key,{record=null}={}){
 if(!scene||!sceneReady){notify('3D 화면을 먼저 불러와야 해요. 저장한 기록은 상단에서 볼 수 있어요.');return;}
 document.body.classList.remove('room-mode');$('returnToRoom').hidden=false;
 captureDraft();source=key;markMode=false;review=null;
 scene.load(key);scene.setRoom(false);scene.setCompare(compare);
 state=visit(state,key);persist();
 $('roomWelcome').hidden=true;$('emptyNote').hidden=true;$('recordForm').hidden=false;$('specimenTools').hidden=false;
 $('comparisonLabels').hidden=!compare;$('sliceControls').hidden=!key.startsWith('artery-');
 $('viewTitle').textContent=SOURCES[key].title;$('sourceTitle').textContent=SOURCES[key].title;
 $('viewEyebrow').textContent='HEART STUDY / '+(key==='surface'?'01':key==='muscle'?'03':'02');
 $('sourceDescription').textContent=SOURCES[key].description;
 $('compareButton').querySelector('span').textContent='참고 구조 비교';
 $('comparisonLabels').children[0].textContent=key==='surface'?'사례 심장':'교육용 사례 단면';
 $('comparisonLabels').children[1].textContent=key==='surface'?'일반 구조 참고 · 별도 제작 정상 모형':'일반 구조 참고 · 같은 자리';
 $('modelNotice').textContent=key==='surface'?'HRA 심장 자료 · 지방·혈관 굵기·색 재구성 · 의학 감수 전':'HRA 심장을 자른 형상 · 조직의 색·형태는 교육용 재구성';
 $('gestureHint').textContent='드래그로 회전 · 방향키로도 조작 가능';
 for(const b of document.querySelectorAll('[data-source]'))b.classList.toggle('active',b.dataset.source===key||(b.dataset.source==='artery-1'&&key.startsWith('artery-')));
 $('roomButton').classList.remove('active');
 for(const b of document.querySelectorAll('[data-slice]'))b.setAttribute('aria-pressed',String(b.dataset.slice===key));
 $('markButton').setAttribute('aria-pressed','false');
 if(record)review=recordView(record);
 renderDraft();updateProgress();
 if(record)notify(review.legacy?'이전 모형의 기록입니다. 내용은 유지하고 옛 위치 표시는 숨겼어요.':'저장 당시의 관찰 위치와 내용을 열었어요. 작성 중인 메모는 보존됩니다.');
}
function openRoom(){
 document.body.classList.add('room-mode');$('returnToRoom').hidden=true;
 captureDraft();source=null;review=null;scene?.setRoom(true);
 $('roomWelcome').hidden=false;$('emptyNote').hidden=false;$('recordForm').hidden=true;$('specimenTools').hidden=true;
 $('sliceControls').hidden=true;$('comparisonLabels').hidden=true;$('viewTitle').textContent='부검실';$('viewEyebrow').textContent='AUTOPSY ROOM';
 $('gestureHint').textContent='WASD 이동 · 드래그로 시선 · 가까이에서 E';$('modelNotice').textContent='교육용 부검실 · 심장: HRA 자료로 만든 모형';
 document.querySelectorAll('[data-source]').forEach(b=>b.classList.remove('active'));$('roomButton').classList.add('active');
}
for(const [value,text] of Object.entries(OBSERVATIONS)){
 const label=document.createElement('label'),input=document.createElement('input');input.type='radio';input.name='observation';input.value=value;input.required=true;
 label.append(input,document.createTextNode(text));$('observationOptions').append(label);
}
for(const [value,text] of Object.entries(QUESTIONS)){const option=document.createElement('option');option.value=value;option.textContent=text;$('questionType').append(option);}
for(const b of document.querySelectorAll('[data-source]'))b.onclick=()=>selectSource(b.dataset.source);
for(const b of document.querySelectorAll('[data-slice]'))b.onclick=()=>selectSource(b.dataset.slice);
$('interactButton').onclick=()=>scene?.interact();
$('mouseLookButton').onclick=()=>scene?.mouseLook();
for(const b of document.querySelectorAll('[data-look]'))b.onclick=()=>{scene?.rotate(Number(b.dataset.look),0);scene?.focus();};
for(const a of document.querySelectorAll('a[href="consult.html"]'))a.onclick=e=>{e.preventDefault();openRoom();experience?.refresh();notify('뒤쪽 카운터의 감정 단말기로 이동해 E를 누르세요.');};
$('returnToRoom').onclick=openRoom;
for(const button of document.querySelectorAll('[data-walk]')){
 button.onclick=()=>scene?.nudge(button.dataset.walk);
 button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);scene?.focus();scene?.hold(button.dataset.walk,true);};
 button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>scene?.hold(button.dataset.walk,false);
}
$('endReview').onclick=()=>selectSource(source);
$('roomButton').onclick=openRoom;
$('rotateLeft').onclick=()=>scene?.rotate(-.2,0);$('rotateRight').onclick=()=>scene?.rotate(.2,0);
$('zoomIn').onclick=()=>scene?.zoom(.15);$('zoomOut').onclick=()=>scene?.zoom(-.15);$('resetView').onclick=()=>scene?.reset();
$('compareButton').onclick=()=>{compare=!compare;scene?.setCompare(compare);$('comparisonLabels').hidden=!compare;$('compareButton').setAttribute('aria-pressed',String(compare));};
$('markButton').onclick=()=>{
 markMode=!markMode;scene?.setMarkMode(markMode);$('markButton').setAttribute('aria-pressed',String(markMode));
 $('gestureHint').textContent=markMode?'모형 위를 클릭해 위치 표시 · 다시 누르면 회전':'드래그로 회전 · 방향키로도 조작 가능';
 if(markMode)notify('사례 모형 위를 클릭하세요. 참고 모형에는 표시하지 않습니다.');
};
$('centerMarkButton').onclick=()=>scene?.markCenter();
$('clearMark').onclick=()=>{if(source){draft(source).mark=null;scene?.setMark(null);syncMark();}};
$('recordForm').addEventListener('input',captureDraft);
$('recordForm').onsubmit=e=>{
 e.preventDefault();if(!source||!sceneReady||review){notify('현재 화면에서는 새 기록을 저장하지 않았어요.');return;}captureDraft();
 try{
  state=addRecord(state,{sourceKey:source,...draft(source)});const durable=persist();updateProgress();
  $('questionRecord').value=state.records.at(-1).id;syncQuestion();
  $('formMessage').textContent=durable?'✓ 기록 '+state.records.length+' 저장됨 · '+SOURCES[source].label:'기기에 저장되지 않았어요. 기록 파일로 보관해 주세요.';
  notify(durable?'관찰을 기록했어요. 다른 단면도 비교해 보세요.':'이번 기록은 화면에만 남아 있어요. 기록 파일로 내보내 주세요.');
 }catch(error){$('formMessage').textContent=error.message;}
};
$('saveQuestion').onclick=()=>{
 try{state=addQuestion(state,{recordId:$('questionRecord').value,question:$('questionType').value});const durable=persist();updateProgress();notify(durable?'관찰에 연결한 질문을 남겼어요.':'질문이 기기에 저장되지 않았어요. 기록 파일로 내보내 주세요.');}
 catch(error){notify(error.message);}
};
$('questionRecord').onchange=syncQuestion;
for(const button of document.querySelectorAll('.close-dialog'))button.onclick=()=>button.closest('dialog').close();
$('caseButton').onclick=()=>$('caseDialog').showModal();
function openNotes(){
 const list=$('recordList');list.replaceChildren();
 if(!state.records.length){const p=document.createElement('p');p.textContent='아직 저장한 관찰 기록이 없어요.';list.append(p);}
 for(const r of [...state.records].reverse()){
  const card=document.createElement('article');card.className='record-card';
  const title=document.createElement('h3');title.textContent=String(r.id.slice(1)).padStart(2,'0')+' · '+SOURCES[r.sourceKey].title;
  const meta=document.createElement('small');meta.textContent=(r.modelVersion===MODEL_VERSION?'모형 관찰 · ':'이전 모형 기록 · ')+(r.mark?'위치 표시 포함':'위치 표시 없음');
  const observation=document.createElement('p');observation.textContent=OBSERVATIONS[r.observation];
  const note=document.createElement('p');note.textContent=r.note;
  const interpretation=document.createElement('p');interpretation.className='record-interpretation';interpretation.textContent='잠정 해석 · '+INTERPRETATIONS[r.interpretation];
  const button=document.createElement('button');button.textContent='이 위치 다시 보기 ↗';button.onclick=()=>{$('notesDialog').close();selectSource(r.sourceKey,{record:r});};
  card.append(title,meta,observation,note,interpretation);
  const q=state.questions.find(q=>q.recordId===r.id);
  if(q){const text=document.createElement('p');text.className='record-question';text.textContent='남은 질문 · '+QUESTIONS[q.question];card.append(text);}
  card.append(button);list.append(card);
 }
 $('exportButton').disabled=!state.records.length;$('notesDialog').showModal();
}
$('notesButton').onclick=$('reviewButton').onclick=openNotes;
$('exportButton').onclick=()=>{
 const data={...state,exportNotice:'교육용 심장 관찰 기록. 진단 보고서나 전체 사건 완료 기록이 아닙니다.'};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='법의관-심장관찰-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
};
$('retryButton').onclick=()=>location.reload();
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&!document.querySelector('dialog[open]')){if(markMode){markMode=false;scene?.setMarkMode(false);$('markButton').setAttribute('aria-pressed','false');$('gestureHint').textContent='드래그로 회전 · 방향키로도 조작 가능';}else if(source)openRoom();}
});
function sceneError(message){sceneReady=false;$('loading').hidden=true;$('sceneError').hidden=false;$('sceneErrorText').textContent=message;document.querySelectorAll('[data-source],[data-slice],#interactButton,#saveRecord,#markButton,#centerMarkButton').forEach(b=>b.disabled=true);}
updateProgress();
if(saved.status==='ok')$('saveStatus').textContent='이전 관찰 기록을 불러왔어요.';
 else if(saved.status!=='empty'){$('saveStatus').textContent='기존 저장을 읽지 못했어요. 이번 기록은 파일로 보관해 주세요.';$('storageWarning').hidden=false;$('storageWarning').textContent='기존 저장을 읽지 못해 덮어쓰기를 중단했어요. 이번 기록은 새로고침 전에 상단 「기록」에서 파일로 저장해 주세요.';}
try{
 scene=await createScene($('canvasHost'),{
  onInteract(id){experience?.interact(id);},
  onHint(message){notify(message);$('mouseLookButton').textContent='드래그 시선 사용 중';$('mouseLookButton').title=message;},
  onNavigation(p){experience?.navigation(p);},
  onProximity(station){$('interactButton').hidden=!station;$('roomPrompt').textContent=station?station.title:'목표 장소에 다가가 바라보세요.';$('interactButton').innerHTML='<kbd>E</kbd> '+(station?station.title+' 열기':'상호작용');},
  onReady(){ sceneReady=true;$('loading').hidden=true; },
  onMark(coords,message){if(message){notify(message);return;}if(source&&!review){draft(source).mark=coords;syncMark();notify('위치를 표시했어요. 관찰 기록을 저장하면 함께 보관됩니다.');}else if(review){scene?.setMark(review.mark);notify('저장 기록 확인 중입니다. 기록 확인을 끝낸 뒤 새 위치를 표시해 주세요.');}},
  onError:sceneError
 });
 experience=createExperience({getObservation:()=>state,getScene:()=>scene,enterHeart:()=>selectSource('surface'),notify,practice});
}catch(error){console.error(error);sceneError('3D 그래픽을 시작하지 못했습니다. 브라우저의 그래픽 지원을 확인하고 새로고침해 주세요.');}
