// Where the reader goes for the parts this app did not verify — qualifications, entry
// routes, pay, outlook. The app states none of those, so these links are the answer to
// "그럼 어디서 확인하나요".
//
// 커리어넷 has a stable address per job (…/job/view?seq=N) but no searchable one: its search
// is a POST, so there is no link that lands on a search result. The numbers below were
// therefore looked up and each one opened and read back on 2026년 9월 21일 — the name in
// `name` is the title 커리어넷 itself shows on that page.
//
// Two jobs are deliberately absent. 전기안전관리자's nearest result is 전기공학기술자 and
// 법의관's is 전문의사, and neither is the same job. Those fall back to the encyclopedia,
// because sending a reader to a different job would be worse than making them search.
//
// If a link ever lands on the wrong job, 커리어넷 renumbered it: re-check the number rather
// than guessing a new one.

const CAREER_NET_LIST = 'https://www.career.go.kr/cloud/w/job/list';
const CAREER_NET_VIEW = 'https://www.career.go.kr/cloud/w/job/view?seq=';

// 고용24 absorbed 워크넷, and www.work.go.kr now redirects there. Its menus are all script
// driven, so there is no per-job address to link to — this one stays at the front door.
const WORK24 = 'https://www.work24.go.kr';

export const CAREER_NET_JOBS = {
 // same job, same name
 'firefighter':           {seq:385,  name:'소방관'},
 'police-officer':        {seq:359,  name:'경찰관'},
 'nurse':                 {seq:354,  name:'간호사'},
 'veterinarian':          {seq:15,   name:'수의사'},
 'emergency-medical':     {seq:397,  name:'응급구조사'},
 'auto-mechanic':         {seq:109,  name:'자동차정비원'},
 'journalist':            {seq:262,  name:'기자'},
 // same work, filed under another name
 'flight-attendant':      {seq:418,  name:'비행기승무원'},
 'chef':                  {seq:173,  name:'조리사 및 주방장'},
 'weather-forecaster':    {seq:5,    name:'일기예보관'},
 'security-analyst':      {seq:435,  name:'정보보호전문가'},
 'environmental-engineer':{seq:1080, name:'환경공학기술자 및 연구원'},
 'robotics-engineer':     {seq:66,   name:'로봇연구원'},
 'film-director':         {seq:322,  name:'영화감독'},
 // narrower than this app's entry, but the closest real page — the name is shown so the
 // reader can see the difference instead of assuming the link went wrong
 'structural-engineer':   {seq:46,   name:'건축공학기술자'},
 'researcher':            {seq:1541, name:'자연과학연구원'},
 'software-developer':    {seq:834,  name:'시스템소프트웨어개발자'},
 'data-analyst':          {seq:10032,name:'빅 데이터 전문가'},
};

export function sourcesFor(jobId){
 const hit=Object.hasOwn(CAREER_NET_JOBS,jobId??'')?CAREER_NET_JOBS[jobId]:null;
 return [
  hit
   ? {name:'커리어넷', href:CAREER_NET_VIEW+hit.seq,
      text:'"'+hit.name+'" 항목으로 바로 갑니다'}
   : {name:'커리어넷', href:CAREER_NET_LIST,
      text:'직업백과 목록에서 직접 찾아보기'},
  {name:'고용24(옛 워크넷)', href:WORK24, text:'직업정보와 한국직업사전'},
 ];
}
