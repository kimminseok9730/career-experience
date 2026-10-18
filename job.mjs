import {LEVELS,categoryOf,findJob,levelText} from './core/jobs.mjs';
import {icon,art,el,bottomNav,toast} from './shell.mjs';
import {readProfile,saveProfile} from './core/profile.mjs';
import {isSaved,toggleSaved} from './core/activity.mjs';
import {moreFor} from './core/more.mjs';

const app=document.getElementById('app');
const job=findJob(new URLSearchParams(location.search).get('id')??'');

// The address is a loopback one until the app is deployed, so a copied link only opens
// on this machine. The button still behaves correctly; the limit is the address itself.
async function shareJob(job){
 const url=location.href;
 if(navigator.share){
  try{ await navigator.share({title:job.name+' · 꿈을 찾아! 드림',text:job.summary,url}); return; }
  catch(error){ if(error?.name==='AbortError')return; }
 }
 try{ await navigator.clipboard.writeText(url); toast('주소를 복사했습니다.'); }
 catch{ toast('이 브라우저에서는 주소 복사를 지원하지 않습니다.'); }
}

function topBar(job=null){
 const save=job?el('button',{class:'icon-btn',type:'button','aria-label':'저장',
  'aria-pressed':String(isSaved(job.id)),
  onclick:e=>{
   const saved=toggleSaved(job.id).includes(job.id);
   e.currentTarget.setAttribute('aria-pressed',String(saved));
   toast(saved?'내 활동에 저장했습니다.':'저장을 해제했습니다.');
  }},icon('bookmark')):null;
 const share=job?el('button',{class:'icon-btn',type:'button','aria-label':'공유',
  onclick:()=>shareJob(job)},icon('share')):null;
 return el('div',{class:'detail-top'},
  el('button',{class:'icon-btn',type:'button','aria-label':'뒤로',
   onclick:()=>{history.length>1?history.back():location.href='index.html';}},icon('back')),
  el('a',{class:'brand',href:'index.html','aria-label':'홈으로'},
   el('img',{src:'assets/brand/logo.png',alt:'꿈을 찾아! 드림'})),
  el('div',{class:'hero-icons'},...[save,share].filter(Boolean)));
}

if(!job){
 app.append(
  el('header',{class:'detail-hero'},art({ratio:'16:9',color:'#7a879a',iconName:'compass'}),topBar(),
   el('div',{class:'detail-caption'},el('h1',{text:'직업을 찾지 못했습니다'}))),
  el('p',{class:'note',style:'margin-top:20px',text:'주소의 직업 번호를 확인해 주세요.'}),
  el('div',{class:'actions'},el('a',{class:'btn fill',href:'index.html',style:'grid-column:1/-1'},
   el('span',{text:'홈으로 돌아가기'}))));
}else{
 const cat=categoryOf(job.category);
 // until a photograph exists the placeholder is all the reader sees, so it uses the job's
 // own icon where one is set rather than the category's
 const mark=job.icon??cat.icon;
 const ready=job.experience==='ready';
 let level=LEVELS.some(l=>l.id===readProfile().gradeBand)?readProfile().gradeBand:LEVELS[0].id;

 const body=el('div',{id:'level-body'});

 function paintLevel(){
  const text=levelText(job,level);
  body.replaceChildren();
  if(!text){
   body.append(el('div',{class:'qa'},icon('bulb'),
    el('div',{},
     el('h3',{text:LEVELS.find(l=>l.id===level).label+' 설명은 준비 중입니다'}),
     el('p',{text:'다른 단계를 선택하면 지금 볼 수 있는 설명이 나옵니다.'}))));
   return;
  }
  body.append(
   el('div',{class:'qa'},icon('bulb'),
    el('div',{},el('h3',{text:text.question}),el('p',{text:text.answer}))),
   el('h2',{class:'sub',text:'이런 일을 해요!'}),
   el('div',{class:'tasks'},...text.tasks.map((task,i)=>
    el('div',{class:'task'},
     art({ratio:'4:3',src:'assets/tasks/'+job.id+'-'+(i+1)+'.jpg',color:cat.color,iconName:mark}),
     el('div',{class:'task-body'},el('h4',{text:task.title}),el('p',{text:task.text}))))),
   el('div',{class:'callout'},
    art({ratio:'1:1',src:'assets/callouts/'+job.id+'-callout.jpg',color:'#f2b73d',iconName:'bulb'}),
    el('p',{text:text.callout})));
 }

 const tabs=el('div',{class:'levels',role:'tablist','aria-label':'설명 수준'});
 for(const item of LEVELS){
  const tab=el('button',{type:'button',role:'tab','aria-selected':String(item.id===level),text:item.label,
   onclick:()=>{level=item.id;saveProfile({gradeBand:item.id});
    for(const other of tabs.children)other.setAttribute('aria-selected',String(other.dataset.id===item.id));
    paintLevel();}});
  tab.dataset.id=item.id;
  tabs.append(tab);
 }

 app.append(
  el('header',{class:'detail-hero'},
   art({ratio:'16:9',src:job.detail?.hero,color:cat.color,iconName:mark,label:job.name}),
   topBar(job),
   el('div',{class:'detail-caption'},
    el('span',{class:'pill',text:cat.label}),
    ...(job.experienceLabel?[el('span',{class:'pill',text:job.experienceLabel+' · 관찰 체험 가능'})]:[]),
    el('h1',{text:job.name}),
    el('p',{text:job.detail?.intro??job.summary}))),
  tabs,body,
  ...(job.detail?.note?[el('p',{class:'note detail-note',text:job.detail.note})]:[]),
  el('div',{class:'actions'},
   moreFor(job.id)
    ?el('a',{class:'btn',href:'more.html?id='+encodeURIComponent(job.id)},
      el('span',{text:'더 자세히 알아보기'}),icon('arrow'))
    :el('button',{class:'btn off',type:'button',
       onclick:()=>toast('더 자세한 자료는 준비 중입니다.')},
      el('span',{text:'더 자세히 준비 중'}),icon('arrow')),
   // experience.html is the electrical-safety scene and nothing else. tests/jobs.test.mjs fails
   // if any other job becomes 'ready', so this link cannot send a second job into it by
   // accident; a second 3D experience needs its own page or an id passed here.
   ready
    ?el('a',{class:'btn fill',href:'experience.html'},icon('gamepad'),el('span',{text:'직업 체험 시작하기'}))
    :job.previewHref
     ?el('a',{class:'btn fill',href:job.previewHref},icon('gamepad'),el('span',{text:job.previewLabel}))
    :el('button',{class:'btn off',type:'button',
       onclick:()=>toast(job.name+' 체험은 준비 중입니다.')},icon('gamepad'),el('span',{text:'체험 준비 중'}))));

 if(!job.detail)body.append(el('div',{class:'qa'},icon('bulb'),
  el('div',{},el('h3',{text:'상세 설명은 준비 중입니다'}),
   el('p',{text:job.name+'의 소개와 체험은 아직 준비하고 있습니다. 먼저 공개된 직업부터 살펴보세요.'}))));
 else paintLevel();
 if(!job.detail)tabs.remove();
}

document.body.append(bottomNav('explore'));
