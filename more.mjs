import {findJob,categoryOf} from './core/jobs.mjs';
import {moreFor} from './core/more.mjs';
import {readableOn} from './core/contrast.mjs';
import {sourcesFor} from './core/sources.mjs';
import {icon,el,bottomNav,jobCard} from './shell.mjs';

const app=document.getElementById('app');
const id=new URLSearchParams(location.search).get('id');
const job=findJob(id);
const more=job?moreFor(job.id):null;

// Somewhere official for the parts this app did not verify — qualifications, routes,
// outlook. Where 커리어넷 has a page for this exact job it is linked directly; see
// core/sources.mjs for which jobs were checked and which deliberately were not.
const SOURCES=job?sourcesFor(job.id):sourcesFor(null);

function top(){
 return el('div',{class:'page-top'},
  el('button',{class:'icon-btn back',type:'button','aria-label':'뒤로',
   onclick:()=>{history.length>1?history.back():location.href='index.html';}},icon('back')),
  el('h1',{text:job?job.name:'직업을 찾지 못했습니다'}),
  el('a',{href:'index.html','aria-label':'홈으로'},
   el('img',{src:'assets/brand/logo.png',alt:'꿈을 찾아! 드림'})));
}

function block(title,iconName,...children){
 return el('section',{class:'section'},
  el('div',{class:'section-head'},el('h2',{},icon(iconName),el('span',{text:title}))),
  ...children);
}

if(!job||!more){
 app.append(top(),
  el('section',{class:'section'},
   el('div',{class:'qa'},icon('bulb'),
    el('div',{},
     el('h3',{text:'자세한 자료는 준비 중입니다'}),
     el('p',{text:(job?job.name+'의':'이 직업의')+' 더 자세한 자료는 아직 정리하고 있습니다. 직업 소개는 먼저 볼 수 있습니다.'})))),
  job?el('div',{class:'actions'},
   el('a',{class:'btn fill',href:'job.html?id='+encodeURIComponent(job.id)},
    icon('back'),el('span',{text:'직업 소개로 돌아가기'}))):null);
}else{
 const cat=categoryOf(job.category);
 const tone=readableOn(cat.color);

 app.append(
  top(),
  el('p',{class:'note',text:job.detail?.intro??''}),

  block('이 직업과 이어지는 과목','flask',
   el('div',{class:'subjects'},...more.subjects.map(s=>
    el('div',{class:'subject'},
     el('span',{class:'subject-name',style:'color:'+tone,text:s.name}),
     el('p',{text:s.why}))))),

  block('지금 해볼 수 있는 것','bulb',
   el('ol',{class:'steps'},...more.actions.map(a=>
    el('li',{class:'step'},
     el('h3',{text:a.title}),
     el('p',{text:a.text}))))),

  block('함께 보면 좋은 직업','compass',
   el('div',{class:'grid'},...more.related.map(r=>{
    const other=findJob(r.id);
    if(!other)return null;
    const card=jobCard(other);
    card.append(el('p',{class:'related-why'},icon('arrow'),el('span',{text:r.why})));
    return card;
   }).filter(Boolean))),

  block('공식 자료에서 더 찾아보기','search',
   el('p',{class:'note',style:'margin-inline:0',text:more.honestLine}),
   el('div',{class:'links'},...SOURCES.map(s=>
    el('a',{class:'link',href:s.href,target:'_blank',rel:'noopener noreferrer'},
     el('div',{},el('strong',{text:s.name}),el('span',{text:s.text})),
     icon('arrow'))))),

  el('div',{class:'actions'},
   el('a',{class:'btn',href:'job.html?id='+encodeURIComponent(job.id)},
    icon('back'),el('span',{text:'직업 소개로'})),
   el('a',{class:'btn fill',href:'explore.html'},
    icon('compass'),el('span',{text:'다른 직업 보기'}))),
 );
}

document.body.append(bottomNav('explore'));
