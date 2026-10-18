export const KEY='dream.forensic.consult.v1';
export const EXAMS={pathology:{title:'병리조직 감정',id:'D16',result:'만성 허혈성 심근 변화에 부합하는 소견입니다. 다른 주요 심근 질환을 강하게 지지하는 소견은 제시되지 않았습니다.',limit:'이 회신만으로 급성 심근경색이나 사망 직전 부정맥의 발생을 확정할 수 없습니다.'},toxicology:{title:'독성학 감정',id:'D17',result:'생전 처방과 부합할 수 있는 성분이 일부 확인되었습니다. 종합 결과는 치명적인 외인성 물질 영향을 지지하지 않습니다.',limit:'성분의 검출 자체가 사인의 증거는 아닙니다. 다른 자료와 함께 판단해야 합니다.'}};
export const fresh=()=>({version:1,caseId:'FM-CASE-01',requests:[],received:false,reflection:null});
const need=(ok,msg)=>{if(!ok)throw Error(msg)};
function text(value){need(typeof value==='string'&&value.trim().length>=8&&value.length<=2400,'근거·질문·목적을 각각 8자 이상 작성해 주세요.');return value.trim();}
export function request(s,input){
 need(!s.received,'회신 확인 후에는 의뢰 내용을 변경할 수 없습니다.');
 need(Object.hasOwn(EXAMS,input.kind),'감정 분야를 선택해 주세요.');
 need(!s.requests.some(r=>r.kind===input.kind),'이미 의뢰한 분야입니다.');
 const r={kind:input.kind,evidence:text(input.evidence),question:text(input.question),purpose:text(input.purpose)};
 return {...s,requests:[...s.requests,r]};
}
export function receive(s){need(s.requests.length>0,'먼저 감정을 의뢰해 주세요.');return {...s,received:true};}
export function interpret(s,input){need(s.received,'먼저 회신을 확인해 주세요.');return {...s,reflection:{supported:text(input.supported),uncertain:text(input.uncertain)}};}
export function restore(raw){
 if(raw==null)return {state:fresh(),status:'empty'};
 try{const saved=JSON.parse(raw);if(saved&&saved.version!==1)return {state:fresh(),status:'incompatible'};
 need(saved?.caseId==='FM-CASE-01'&&Array.isArray(saved.requests)&&typeof saved.received==='boolean','invalid');
 let s=fresh();for(const r of saved.requests)s=request(s,r);
 if(saved.received)s=receive(s);if(saved.reflection!==null)s=interpret(s,saved.reflection);
 return {state:s,status:'ok'};
 }catch{return {state:fresh(),status:'corrupt'};}
}
