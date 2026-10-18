import {JOBS,categoryOf,filterJobs} from './core/jobs.mjs';
import {icon,art,el,bottomNav,toast,jobCard,jobGrid,searchBar,categoryRow} from './shell.mjs';

const app=document.getElementById('app');
const state={category:'all',query:''};

// The home screen is a doorway, not the catalogue. Past this many cards the reader is
// scrolling past jobs rather than choosing one, so the rest lives behind 더보기.
const PREVIEW=6;

function section(title,jobs,{more=null}={}){
 return el('section',{class:'section'},
  el('div',{class:'section-head'},
   el('h2',{text:title}),
   more?el('a',{class:'more',href:more},el('span',{text:'더보기'}),icon('chevron')):null),
  jobGrid(jobs));
}

function hero(){
 const box=el('header',{class:'hero'});
 box.append(
  art({ratio:'2:1',src:'assets/heroes/home-hero.jpg',color:'#5aa6e8',iconName:'compass'}),
  el('div',{class:'hero-inner'},
   el('div',{class:'hero-top'},
    el('div',{class:'brand'},el('img',{src:'assets/brand/logo.png',alt:'꿈을 찾아! 드림'})),
    el('div',{class:'hero-icons'},
     ...['search','bell','user'].map(name=>el('button',{class:'icon-btn',type:'button',
      'aria-label':{search:'검색',bell:'알림',user:'내 정보'}[name],
      onclick:()=>name==='search'?location.href='explore.html':toast('준비 중입니다.')},icon(name))))),
   el('p',{class:'hero-tag',html:'지금, 너의 꿈이<br>더 넓은 세상으로!'})));
 // the tagline sits under the wordmark inside the brand block
 box.querySelector('.brand').append(el('span',{html:'<b>다양한 직업</b>을 경험하는<br><b>나만의 진로 탐험</b> 플랫폼'}));
 return box;
}

const results=el('div',{id:'results'});

function paintResults(){
 const filtering=state.category!=='all'||state.query.trim()!=='';
 results.replaceChildren();
 if(!filtering){
  results.append(
   section('🔥 추천 직업',JOBS.filter(j=>j.featured).slice(0,PREVIEW),{more:'explore.html?only=featured'}),
   section('✨ 새로 추가된 직업',JOBS.filter(j=>j.isNew).slice(0,PREVIEW),{more:'explore.html?only=new'}));
  return;
 }
 const found=filterJobs(state);
 const label=state.query.trim()?'"'+state.query.trim()+'" 검색 결과':categoryOf(state.category).label;
 results.append(section(label+' · '+found.length+'개',found));
}

app.append(
 hero(),
 searchBar({overlap:true,onInput:v=>{state.query=v;paintResults();},
            onFilter:()=>{location.href='explore.html';}}),
 categoryRow({active:state.category,onSelect:id=>{state.category=id;paintResults();}}),
 results);
paintResults();
document.body.append(bottomNav('home'));
