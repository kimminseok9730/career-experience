import {filterJobs,categoryOf} from './core/jobs.mjs';
import {icon,el,bottomNav,jobGrid,searchBar,categoryRow} from './shell.mjs';

const app=document.getElementById('app');
const params=new URLSearchParams(location.search);

// an unknown ?only= is dropped rather than shown as an empty list
const GROUPS={featured:'🔥 추천 직업',new:'✨ 새로 추가된 직업'};
const state={
 category:'all',
 query:'',
 readyOnly:false,
 sort:'default',
 only:Object.hasOwn(GROUPS,params.get('only'))?params.get('only'):null,
};

const results=el('div',{id:'results'});
const count=el('span',{class:'count'});
let groupChip=null;

function paint(){
 const found=filterJobs(state);
 count.textContent=found.length+'개';
 if(groupChip)groupChip.hidden=!state.only;
 results.replaceChildren(el('section',{class:'section',style:'padding-top:14px'},jobGrid(found)));
}

function pageTop(){
 return el('div',{class:'page-top'},
  el('h1',{text:'직업 탐색'}),
  el('a',{href:'index.html','aria-label':'홈으로'},
   el('img',{src:'assets/brand/logo.png',alt:'꿈을 찾아! 드림'})));
}

function tools(){
 const ready=el('button',{class:'toggle',type:'button','aria-pressed':'false',
  onclick:e=>{state.readyOnly=!state.readyOnly;
   e.currentTarget.setAttribute('aria-pressed',String(state.readyOnly));paint();}},
  icon('gamepad'),el('span',{text:'체험 가능만'}));

 const sort=el('select',{class:'sort','aria-label':'정렬',
  onchange:e=>{state.sort=e.target.value;paint();}});
 for(const [value,label] of [['default','기본순'],['name','가나다순']])sort.add(new Option(label,value));

 // shown only when the screen was opened from one of the home sections
 groupChip=el('button',{class:'toggle group',type:'button','aria-pressed':'true',
  onclick:()=>{state.only=null;paint();}},
  el('span',{text:GROUPS[state.only]??''}),icon('chevron'));
 groupChip.hidden=!state.only;

 return el('div',{class:'tools'},count,groupChip,ready,sort);
}

app.append(
 pageTop(),
 searchBar({placeholder:'직업 이름이나 분야로 찾기',
  onInput:v=>{state.query=v;paint();},
  onFilter:()=>{state.category='all';state.query='';state.readyOnly=false;state.only=null;
   state.sort='default';location.href='explore.html';}}),
 categoryRow({active:state.category,onSelect:id=>{state.category=id;paint();}}),
 tools(),
 results);
paint();
document.body.append(bottomNav('explore'));
