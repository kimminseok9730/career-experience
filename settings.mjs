import {LEVELS} from './core/jobs.mjs';
import {readProfile,saveProfile,clearProfile} from './core/profile.mjs';
import {icon,el,bottomNav,toast} from './shell.mjs';

const app=document.getElementById('app');
let profile=readProfile();

const DESCRIPTION={
 elementary:'쉬운 말로 무엇을 하는 직업인지 알려줍니다.',
 secondary:'어떻게 판단하고 왜 한 가지 근거로는 부족한지까지 설명합니다.',
};

function levelChoice(){
 const box=el('div',{class:'choices',role:'radiogroup','aria-label':'설명 수준'});
 for(const level of LEVELS){
  const button=el('button',{class:'choice',type:'button',role:'radio',
   'aria-checked':String(level.id===profile.gradeBand),
   onclick:()=>{
    profile=saveProfile({gradeBand:level.id});
    for(const other of box.children)other.setAttribute('aria-checked',String(other.dataset.id===profile.gradeBand));
    toast(level.label+' 설명으로 맞췄습니다.');
   }},
   el('strong',{text:level.label}),
   el('span',{text:DESCRIPTION[level.id]??''}),
   icon('shield'));
  button.dataset.id=level.id;
  box.append(button);
 }
 return box;
}

function group(title,...children){
 return el('section',{class:'settings-group'},el('h2',{text:title}),...children);
}

app.append(
 el('div',{class:'page-top'},
  el('h1',{text:'설정'}),
  el('a',{href:'index.html','aria-label':'홈으로'},
   el('img',{src:'assets/brand/logo.png',alt:'꿈을 찾아! 드림'}))),

 group('설명 수준',
  el('p',{class:'note',text:'직업 상세 화면이 이 수준으로 먼저 열립니다. 상세 화면에서 탭을 바꿔도 여기에 반영됩니다.'}),
  levelChoice()),

 group('계정',
  el('p',{class:'note',text:'구글·카카오 로그인은 준비 중입니다. 계정이 생기면 본 직업과 체험 기록을 기기가 바뀌어도 이어서 볼 수 있습니다.'}),
  el('button',{class:'btn off',type:'button',style:'width:100%',
   onclick:()=>toast('로그인은 준비 중입니다.')},icon('user'),el('span',{text:'로그인 준비 중'}))),

 group('저장된 정보',
  el('p',{class:'note',text:'설명 수준은 이 브라우저에만 저장됩니다. 이름이나 이메일 같은 개인정보는 받지 않습니다. 저장한 직업 목록은 내 활동 화면에서 비울 수 있습니다.'}),
  el('button',{class:'btn',type:'button',style:'width:100%',
   onclick:()=>{
    profile=clearProfile();
    for(const other of app.querySelectorAll('.choice'))
     other.setAttribute('aria-checked',String(other.dataset.id===profile.gradeBand));
    toast('저장된 설정을 지웠습니다.');
   }},el('span',{text:'저장된 설정 지우기'}))),
);
document.body.append(bottomNav('settings'));
