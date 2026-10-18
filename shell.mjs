import {activeCategories,categoryOf} from './core/jobs.mjs';
import {ICON_PATHS} from './core/icons.mjs';
import {readableOn} from './core/contrast.mjs';
// Shared rendering for the app shell. Placeholder art stands in until real photography is
// dropped into assets/; a missing file degrades to the gradient instead of a broken image.


export function icon(name,{width=null}={}){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');
 svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width',name==='dots'?'2.6':'1.8');
 svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
 svg.setAttribute('aria-hidden','true');
 if(width)svg.style.width=width;
 const path=document.createElementNS('http://www.w3.org/2000/svg','path');
 path.setAttribute('d',ICON_PATHS[name]??ICON_PATHS.dots);svg.append(path);
 return svg;
}

// Only files listed in the manifest are requested, so an empty assets folder produces
// placeholders with a clean console instead of a wall of 404s.
let available=null;
const manifestReady=fetch('assets/manifest.json')
 .then(response=>response.ok?response.json():[])
 .catch(()=>[])
 .then(list=>{available=new Set(Array.isArray(list)?list:[]);});

const darken=(hex,amount=.42)=>{
 const n=parseInt(hex.slice(1),16);
 const mix=v=>Math.round(v*(1-amount));
 return '#'+[mix(n>>16&255),mix(n>>8&255),mix(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('');
};

export function art({ratio='3:2',src=null,color='#2f6fed',iconName='gear',label=''}={}){
 const box=document.createElement('div');
 box.className='art';box.dataset.ratio=ratio;
 box.style.background='linear-gradient(145deg,'+color+' 0%,'+darken(color)+' 100%)';
 box.style.color='#fff';
 box.append(icon(iconName));
 if(label)box.setAttribute('aria-label',label);else box.setAttribute('aria-hidden','true');
 // a real photograph replaces the placeholder only once it is listed and has loaded
 if(src)manifestReady.then(()=>{
  if(!available.has(src))return;
  const img=new Image();img.alt=label;
  img.addEventListener('load',()=>{
   // the detail hero paints a blurred copy behind the photo from this; other boxes ignore it
   box.style.setProperty('--photo','url("'+new URL(src,location.href).href+'")');
   box.append(img);
  });
  img.src=src;
 });
 return box;
}

export function el(tag,props={},...children){
 const node=document.createElement(tag);
 for(const [key,value] of Object.entries(props)){
  if(key==='class')node.className=value;
  else if(key==='html')node.innerHTML=value;
  else if(key==='text')node.textContent=value;
  else if(key.startsWith('on'))node.addEventListener(key.slice(2),value);
  else if(value!==null&&value!==false)node.setAttribute(key,value===true?'':value);
 }
 node.append(...children.filter(Boolean));
 return node;
}

// ---------- pieces the home and explore screens both draw ----------
// They live here so a change to a job card reaches every screen at once.

export function jobCard(job){
 const cat=categoryOf(job.category);
 const ready=job.experience==='ready';
 return el('a',{class:'job',href:'job.html?id='+encodeURIComponent(job.id)},
  art({ratio:'3:2',src:job.thumb,color:cat.color,iconName:job.icon??cat.icon,label:job.name}),
  el('div',{class:'job-body'},
   el('h3',{text:job.name}),
   el('span',{class:'tag',style:'color:'+readableOn(cat.color),text:cat.label}),
   el('p',{text:job.summary}),
   el('span',{class:'state '+(ready?'ready':'preparing'),text:job.experienceLabel??(ready?'3D 체험 가능':'체험 준비 중')}),
  ));
}

// onRemove turns each card into a removable one. The button cannot live inside the card's
// <a> — a button nested in a link breaks both the click and the screen reader — so it sits
// beside it in a wrapper that the grid lays out in the card's place.
export function jobGrid(jobs,{onRemove=null,empty='조건에 맞는 직업이 아직 없습니다.'}={}){
 if(!jobs.length)return el('p',{class:'empty',text:empty});
 return el('div',{class:'grid'},...jobs.map(job=>{
  const card=jobCard(job);
  if(!onRemove)return card;
  return el('div',{class:'saved-item'},card,
   el('button',{class:'unsave',type:'button','aria-label':job.name+' 저장 해제',
    onclick:()=>onRemove(job)},icon('close')));
 }));
}

export function searchBar({value='',placeholder='어떤 직업이 궁금한가요?',overlap=false,onInput,onFilter}={}){
 const input=el('input',{type:'search',placeholder,'aria-label':'직업 검색',
  oninput:e=>onInput?.(e.target.value)});
 input.value=value;
 return el('div',{class:'search'+(overlap?' search--hero':'')},icon('search'),input,
  el('button',{class:'icon-btn',type:'button','aria-label':'검색 조건',
   style:'background:#f1f3f7;color:#6b7684;width:28px;height:28px',
   onclick:()=>onFilter?.()},icon('sliders')));
}

export function categoryRow({active='all',onSelect}={}){
 const box=el('div',{class:'cats'});
 for(const cat of activeCategories()){
  const button=el('button',{class:'cat',type:'button','aria-pressed':String(cat.id===active),
   onclick:()=>{
    for(const other of box.children)other.setAttribute('aria-pressed',String(other.dataset.id===cat.id));
    onSelect?.(cat.id);
   }},
   icon(cat.icon),el('span',{text:cat.label}));
  button.dataset.id=cat.id;
  button.querySelector('svg').style.color=cat.color;
  box.append(button);
 }
 return box;
}

const NAV=[
 {id:'home',    label:'홈',        iconName:'home',      href:'index.html'},
 {id:'explore', label:'직업 탐색',  iconName:'compass',   href:'explore.html'},
 {id:'activity',label:'내 활동',    iconName:'clipboard', href:'activity.html'},
 {id:'settings',label:'설정',      iconName:'gear',      href:'settings.html'},
];

export function bottomNav(active='home'){
 const nav=el('nav',{class:'nav','aria-label':'주요 메뉴'});
 for(const item of NAV){
  const button=el('button',{type:'button',...(item.id===active?{'aria-current':'page'}:{}),
   onclick:()=>{ if(item.id===active)return;
    if(item.href)location.href=item.href; else toast(item.label+' 화면은 준비 중입니다.'); }},
   icon(item.iconName),el('span',{text:item.label}));
  nav.append(button);
 }
 return nav;
}

let toastTimer=null;
export function toast(message){
 let box=document.querySelector('.toast');
 if(!box){box=el('div',{class:'toast',role:'status'});document.body.append(box);}
 box.textContent=message;box.hidden=false;
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>{box.hidden=true;},2200);
}
