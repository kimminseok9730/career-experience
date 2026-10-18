import {savedJobs,toggleSaved,clearActivity} from './core/activity.mjs';
import {icon,el,bottomNav,jobGrid,toast} from './shell.mjs';

const app=document.getElementById('app');
const results=el('div',{id:'results'});
const count=el('span',{class:'count'});
let clearButton=null;

// Nothing saved yet is a normal state, not an error — it points at where to find jobs.
function emptyState(){
 return el('div',{class:'blank'},
  icon('bookmark'),
  el('h2',{text:'아직 저장한 직업이 없습니다'}),
  el('p',{text:'직업 상세 화면 오른쪽 위의 북마크를 누르면 여기에 모입니다.'}),
  el('a',{class:'btn fill',href:'explore.html'},icon('compass'),el('span',{text:'직업 탐색하러 가기'})));
}

function paint(){
 const jobs=savedJobs();
 count.textContent=jobs.length+'개';
 if(clearButton)clearButton.hidden=jobs.length===0;
 results.replaceChildren(jobs.length
  ?el('section',{class:'section',style:'padding-top:14px'},jobGrid(jobs,{
   onRemove:job=>{toggleSaved(job.id);paint();toast(job.name+' 저장을 해제했습니다.');}}))
  :emptyState());
}

app.append(
 el('div',{class:'page-top'},
  el('h1',{text:'내 활동'}),
  el('a',{href:'index.html','aria-label':'홈으로'},
   el('img',{src:'assets/brand/logo.png',alt:'꿈을 찾아! 드림'}))),

 el('p',{class:'note',text:'저장한 직업은 이 브라우저에만 남습니다. 계정이 생기면 기기가 바뀌어도 이어서 볼 수 있습니다.'}),

 (()=>{
  clearButton=el('button',{class:'toggle',type:'button',
   onclick:()=>{
    if(!confirm('저장한 직업을 모두 지울까요? 되돌릴 수 없습니다.'))return;
    clearActivity();paint();toast('저장 목록을 비웠습니다.');
   }},icon('dots'),el('span',{text:'목록 비우기'}));
  return el('div',{class:'tools'},count,clearButton);
 })(),

 results);
paint();
document.body.append(bottomNav('activity'));
