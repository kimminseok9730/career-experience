// The catalogue the app shell renders. Only a job whose 3D scene is actually built may say
// so — every other entry stays 'preparing' rather than promising something that is not there.
// Level texts describe the same work at two depths (초등학생 / 중·고등학생); regulations,
// licences and inspection intervals are deliberately absent because they are not verified here.
// The three task illustrations are shared by both levels, so task 1, 2 and 3 have to name the
// same action at both depths.

export const CATEGORIES = [
 {id:'all',      label:'전체',        icon:'grid',    color:'#2f6fed'},
 {id:'industry', label:'산업·기술',   icon:'gear',    color:'#1f9d55'},
 {id:'medical',  label:'의료·보건',   icon:'aid',     color:'#e4453a'},
 {id:'science',  label:'과학·연구',   icon:'flask',   color:'#2f6fed'},
 {id:'safety',   label:'공공·안전',   icon:'shield',  color:'#1f9d55'},
 {id:'build',    label:'건축·환경',   icon:'leaf',    color:'#3fa05a'},
 {id:'art',      label:'문화·예술',   icon:'palette', color:'#b246c9'},
 {id:'it',       label:'IT·컴퓨터',   icon:'monitor', color:'#2f6fed'},
 {id:'service',  label:'서비스·경영', icon:'people',  color:'#2f6fed'},
 {id:'etc',      label:'기타',        icon:'dots',    color:'#7a879a'},
];

export const LEVELS = [
 {id:'elementary', label:'초등학생'},
 {id:'secondary',  label:'중·고등학생'},
];

const electricalSafety = {
 elementary:{
  question:'전기안전관리자는 어떤 일을 하나요?',
  answer:'전기가 안전하게 사용되고 있는지 살펴보는 사람입니다. 건물이나 공장 등에서 전기 시설을 확인하고, 위험한 곳이 없는지 찾아 사고가 나지 않도록 도와줍니다.',
  tasks:[
   {title:'전기 시설을 살펴요', text:'건물 곳곳의 전기 시설이 잘 작동하는지 확인해요.'},
   {title:'문제를 찾아요',     text:'위험할 수 있는 부분이 없는지 꼼꼼히 살펴봐요.'},
   {title:'안전하게 조치해요', text:'문제가 발견되면 바로 고치고 다른 사람들에게 알려요.'},
  ],
  callout:'전기안전관리자가 있으면 우리의 생활이 더 안전하고 편리해져요!',
 },
 secondary:{
  question:'표시 하나로 원인을 알 수 있을까요?',
  answer:'정해진 순서로 현장을 돌며 계기의 숫자와 표시등을 직접 읽고, 평소와 다른 점을 기록합니다. 다만 표시 하나로는 원인을 확정할 수 없습니다. 펌프가 멈췄다는 표시가 떠도 펌프 자체의 문제인지 전원 쪽 문제인지 구분되지 않기 때문에, 사건 기록·전압·전류처럼 서로 독립적인 근거를 모아 대조합니다. 확인된 것과 아직 확인하지 못한 것을 나누어 남기는 것까지가 이 일입니다.',
  tasks:[
   {title:'정해진 순서로 돌아봐요', text:'빠뜨리는 곳이 없도록 점검 지점을 정해 두고 차례로 확인합니다.'},
   {title:'독립적인 근거를 모아요', text:'서로 다른 출처의 값이 같은 결론을 가리킬 때 판단이 단단해집니다.'},
   {title:'본 것과 추정을 구분해요', text:'직접 관찰한 것, 추정한 것, 전문팀이 회신한 것을 섞지 않습니다.'},
  ],
  callout:'같은 표시라도 원인이 다를 수 있습니다. 구분하는 힘이 이 직업의 실력입니다.',
 },
};

const forensicPathology = {
 elementary:{
  question:'법의관은 어떤 일을 하나요?',
  answer:'사람이 왜 돌아가셨는지 과학으로 밝혀내는 의사입니다. 눈으로 꼼꼼히 살피고 현미경과 검사 장비로 확인한 다음, 알아낸 사실을 있는 그대로 알려줍니다. 그래야 억울한 일이 생기지 않고, 남은 가족도 무슨 일이 있었는지 알 수 있습니다.',
  tasks:[
   {title:'꼼꼼히 살펴요',     text:'눈에 보이는 것을 빠뜨리지 않고 하나하나 기록해요.'},
   {title:'과학으로 확인해요', text:'현미경과 검사 장비로 눈으로는 알 수 없는 것까지 알아봐요.'},
   {title:'사실대로 알려줘요', text:'알아낸 것과 아직 모르는 것을 나누어 정직하게 전해요.'},
  ],
  callout:'법의관이 밝혀낸 사실은 억울한 사람이 생기지 않도록 지켜 줍니다.',
 },
 secondary:{
  question:'겉모습만으로 사인을 알 수 있을까요?',
  answer:'겉으로 보이는 것부터 정해진 순서대로 기록하고, 필요한 시료를 떼어 조직검사와 약독물 검사를 의뢰합니다. 다만 같은 소견이 서로 다른 원인에서 나올 수 있어 한 가지만으로는 결론을 내릴 수 없습니다. 그래서 사인과 사망의 종류를 나누어 다루고, 현장에서 온 정보와 진료 기록, 검사 결과가 같은 방향을 가리키는지 대조합니다. 확정할 수 없는 부분은 확정하지 않고 그대로 남깁니다.',
  tasks:[
   {title:'순서대로 기록해요',    text:'나중에 다시 확인할 수 있도록 본 것을 빠짐없이 남깁니다.'},
   {title:'독립적인 근거를 맞춰요', text:'현장·진료 기록·검사 결과가 하나의 상태로 설명되는지 봅니다.'},
   {title:'관찰과 해석을 구분해요', text:'본 것, 검사로 확인된 것, 추론한 것을 섞어 적지 않습니다.'},
  ],
  callout:'같은 소견이라도 원인이 다를 수 있습니다. 구분하는 힘이 이 직업의 실력입니다.',
 },
};

const securityAnalysis = {
 elementary:{
  question:'사이버보안 분석가는 어떤 일을 하나요?',
  answer:'우리가 쓰는 컴퓨터와 누리집에 누가 몰래 들어오려 하는지 지켜보는 사람입니다. 컴퓨터는 누가 언제 어디서 들어왔는지 기록을 남기는데, 그 기록을 보고 평소와 다른 점을 찾아냅니다. 위험한 것이 확인되면 바로 막고, 무슨 일이 있었는지 알기 쉽게 알려 줍니다.',
  tasks:[
   {title:'이상한 신호를 살펴요',  text:'평소와 다른 접속이나 경고가 없는지 지켜봐요.'},
   {title:'여러 기록을 맞춰 봐요', text:'기록 하나만 보지 않고 여러 기록을 함께 비교해요.'},
   {title:'안전하게 막고 알려요',  text:'확인된 위험은 바로 막고, 무슨 일이 있었는지 전해요.'},
  ],
  callout:'사이버보안 분석가가 지켜 주어서 우리의 사진과 이야기가 안전하게 남아 있어요!',
 },
 secondary:{
  question:'경고가 떴다면 공격을 받은 걸까요?',
  answer:'경고는 평소와 다르다는 신호일 뿐, 원인까지 알려 주지는 않습니다. 로그인 실패가 갑자기 늘었다면 공격일 수도 있고, 비밀번호를 바꾼 뒤 옛 비밀번호가 저장된 기기가 계속 시도하는 것일 수도 있고, 설정이 잘못된 것일 수도 있습니다. 그래서 접속 기록·접속한 곳·사용한 기기·시각처럼 서로 다른 데서 나온 기록이 하나의 상황으로 설명되는지 맞춰 봅니다. 그리고 기록으로 확인된 것과 추정을 나누어 적습니다. 누가 했는지는 대개 추정에 가깝고, 확정하려면 근거가 더 필요합니다.',
  tasks:[
   {title:'평소 모습을 먼저 알아요',    text:'평소의 접속 시간과 양을 알아야 무엇이 이상한지 판단할 수 있습니다.'},
   {title:'독립적인 근거를 맞춰요',    text:'접속 기록·위치·기기가 하나의 상황으로 설명되는지 봅니다.'},
   {title:'확인된 것과 추정을 구분해요', text:'"공격을 받았다"와 "공격일 가능성이 높다"는 다른 문장입니다.'},
  ],
  callout:'같은 경고라도 원인이 다를 수 있습니다. 구분하는 힘이 이 직업의 실력입니다.',
 },
};

const emergencyMedical = {
 elementary:{
  question:'응급구조사는 어떤 일을 하나요?',
  answer:'갑자기 다치거나 아픈 사람에게 가장 먼저 달려가는 사람입니다. 어디가 얼마나 급한지 빠르게 확인하고, 숨을 쉬고 피가 잘 돌도록 바로 도와줍니다. 그리고 병원으로 옮기면서 무엇을 보았고 어떤 처치를 했는지 의사에게 그대로 전해 줍니다.',
  tasks:[
   {title:'빠르게 살펴요',      text:'어디가 아픈지, 얼마나 급한지 먼저 확인해요.'},
   {title:'필요한 처치를 해요',  text:'숨과 피가 잘 돌도록 바로 도와줘요.'},
   {title:'병원에 정확히 전해요', text:'본 것과 한 처치를 빠짐없이 전달해요.'},
  ],
  callout:'응급구조사가 먼저 도착해 주어서, 병원에 닿기까지의 시간을 버틸 수 있어요.',
 },
 secondary:{
  question:'의식이 흐리다면 무엇 때문일까요?',
  answer:'같은 모습이라도 원인은 여러 가지입니다. 저혈당일 수도, 탈수일 수도, 머리를 부딪힌 것일 수도 있습니다. 그래서 정해진 순서로 기도와 호흡, 순환을 빠짐없이 확인하고, 맥박과 호흡, 혈당처럼 서로 다른 신호가 하나의 상태로 설명되는지 봅니다. 원인을 정하는 것은 의사의 일이므로, 본 것과 잰 값, 자신이 한 처치를 시각과 함께 남겨 병원에 인계합니다. 짐작한 부분은 짐작이라고 밝혀 전합니다.',
  tasks:[
   {title:'정해진 순서로 확인해요',  text:'급할수록 순서를 지켜야 빠뜨리는 곳이 없습니다.'},
   {title:'여러 신호를 함께 봐요',   text:'맥박·호흡·혈당이 하나의 상태로 설명되는지 봅니다.'},
   {title:'본 것과 추정을 나눠 전해요', text:'잰 값과 짐작을 섞어 전하면 병원의 판단이 흔들립니다.'},
  ],
  callout:'같은 증상이라도 원인이 다를 수 있습니다. 구분해서 전하는 것이 이 직업의 실력입니다.',
 },
};

const research = {
 elementary:{
  question:'연구원은 어떤 일을 하나요?',
  answer:'아직 아무도 모르는 것을 알아내는 사람입니다. 궁금한 것을 분명하게 정하고, 그것을 확인할 수 있는 실험을 만들어 직접 해 봅니다. 한 번 해 보고 끝내지 않고 여러 번 다시 해 보면서, 생각과 다른 결과가 나와도 있는 그대로 적습니다.',
  tasks:[
   {title:'궁금한 것을 찾아요',  text:'무엇이 궁금한지 분명하게 정해요.'},
   {title:'비교하며 실험해요',   text:'한 가지만 바꾸고 나머지는 똑같이 해서 비교해요.'},
   {title:'있는 그대로 기록해요', text:'생각과 다른 결과가 나와도 그대로 적어요.'},
  ],
  callout:'생각과 다른 결과도 그대로 적는 사람이 있어서, 우리가 아는 것이 늘어나요.',
 },
 secondary:{
  question:'실험 결과가 나왔다면 증명된 걸까요?',
  answer:'한 번의 결과는 우연일 수 있습니다. 그래서 확인할 방법이 있는 질문으로 먼저 다듬고, 바꾸는 조건 하나만 빼고 나머지를 똑같이 맞춘 대조군을 둡니다. 같은 실험을 반복하고, 가능하면 다른 방법으로도 확인합니다. 기록할 때는 측정한 값과 그 값을 설명하는 해석을 나누어 적습니다. 해석은 나중에 바뀔 수 있지만 측정값은 그대로 남기 때문입니다.',
  tasks:[
   {title:'검증할 수 있게 질문을 다듬어요', text:'확인할 방법이 없는 질문은 답을 낼 수 없습니다.'},
   {title:'대조군을 두고 반복해요',      text:'비교할 것이 있어야 결과가 의미를 가집니다.'},
   {title:'결과와 해석을 구분해 적어요',   text:'측정한 값과 그것을 설명하는 말은 다릅니다.'},
  ],
  callout:'한 번의 결과로 결론을 내지 않는 태도 — 다른 직업들이 쓰는 방법도 여기에서 나왔습니다.',
 },
};

const filmDirecting = {
 elementary:{
  question:'영상감독은 어떤 일을 하나요?',
  answer:'보는 사람에게 무엇을 느끼게 할지 정하고, 그것이 잘 전해지도록 장면을 만드는 사람입니다. 어디서 찍을지, 배우가 어떻게 움직일지, 빛과 소리를 어떻게 쓸지 하나하나 고릅니다. 그리고 찍은 것을 바로 화면으로 보면서 생각한 대로 보이는지 확인하고 다시 찍기도 합니다.',
  tasks:[
   {title:'어떤 이야기인지 정해요', text:'무엇을 보여주고 싶은지 먼저 정해요.'},
   {title:'어떻게 보여줄지 골라요', text:'같은 장면도 카메라 위치와 빛에 따라 느낌이 달라져요.'},
   {title:'보여주고 확인해요',    text:'생각한 대로 전해졌는지 직접 보고 고쳐요.'},
  ],
  callout:'영상감독이 골라 준 장면 덕분에, 우리는 말이 없어도 마음을 느낄 수 있어요.',
 },
 secondary:{
  question:'같은 장면인데 왜 다르게 느껴질까요?',
  answer:'카메라를 어디에 두는지, 얼마나 가까이 가는지, 빛이 어느 쪽에서 오는지, 어떤 소리를 남기고 지우는지에 따라 같은 말도 다르게 들립니다. 그래서 이 장면으로 무엇을 전할지 한 문장으로 먼저 정해 두고 그 기준으로 고릅니다. 한 가지 방법만 믿지 않고 여러 방법으로 찍어 두었다가 이어 붙여 비교합니다. 마지막에는 의도와 전달을 구분합니다. 의도한 것과 관객이 실제로 느낀 것은 다를 수 있고, 그것은 보여 주기 전에는 알 수 없습니다.',
  tasks:[
   {title:'전하려는 것을 한 문장으로 정해요', text:'기준이 없으면 선택할 때마다 흔들립니다.'},
   {title:'여러 방법으로 찍어 둬요',       text:'각도와 빛, 소리에 따라 같은 장면이 달라집니다.'},
   {title:'의도와 전달을 구분해요',        text:'의도한 것과 관객이 느낀 것은 다를 수 있습니다.'},
  ],
  callout:'같은 장면이라도 찍는 방법에 따라 뜻이 달라집니다. 그 차이를 다룰 줄 아는 것이 이 직업의 실력입니다.',
 },
};

const structuralEngineering = {
 elementary:{
  question:'건축구조기술자는 어떤 일을 하나요?',
  answer:'건물이 무너지지 않도록 뼈대를 계산하는 사람입니다. 건물에 실리는 무게와 바람, 땅의 흔들림까지 하나씩 세어 보고, 기둥과 보를 얼마나 굵게 해야 하는지 정합니다. 딱 맞게 하지 않고 넉넉하게 여유를 두며, 다 지은 뒤에도 금이 간 곳이 없는지 살펴봅니다.',
  tasks:[
   {title:'어떤 힘이 걸리는지 세어요', text:'무게와 바람, 흔들림을 빠뜨리지 않고 하나씩 세어요.'},
   {title:'여유를 두고 계산해요',    text:'딱 맞게 하지 않고 더 튼튼하게 만들어요.'},
   {title:'지은 뒤에도 살펴요',     text:'생긴 금이 위험한 것인지 확인해요.'},
  ],
  callout:'건축구조기술자가 남겨 둔 여유 덕분에, 우리가 건물 안에서 안심하고 지낼 수 있어요.',
 },
 secondary:{
  question:'벽에 금이 갔다면 위험한 걸까요?',
  answer:'같은 금이라도 원인은 다릅니다. 콘크리트가 마르면서 생긴 가는 금일 수도, 땅이 조금 내려앉아 생긴 금일 수도, 예상보다 큰 무게가 실려 생긴 금일 수도 있습니다. 그래서 금의 방향과 폭을 재고, 시간이 지나며 넓어지는지를 함께 봅니다. 계산 자체도 가정 위에서 이루어집니다. 실제로 실릴 무게와 재료의 힘을 정확히 알 수는 없기 때문에, 확인된 값과 가정한 값을 구분하고 그만큼 여유를 둡니다. 확인되지 않은 것은 확정해 적지 않습니다.',
  tasks:[
   {title:'하중을 빠짐없이 모아요',     text:'무게·바람·지진 중 하나라도 빠지면 계산이 의미를 잃습니다.'},
   {title:'가정한 값에는 여유를 둬요',  text:'정확히 알 수 없는 값이 있으므로 그만큼을 남겨 둡니다.'},
   {title:'같은 금도 원인을 나눠 봐요', text:'방향과 폭, 시간에 따른 변화가 원인을 가릅니다.'},
  ],
  callout:'같은 금이라도 원인이 다를 수 있습니다. 구분해 내는 힘이 이 직업의 실력입니다.',
 },
};

const cabinSafety = {
 elementary:{
  question:'항공승무원은 어떤 일을 하나요?',
  answer:'비행기 안에서 승객이 안전하게 갈 수 있도록 돌보는 사람입니다. 출발 전에 비상 장비가 제자리에 있는지 하나씩 확인하고, 하늘에서는 평소와 다른 소리나 냄새가 나지 않는지, 힘들어하는 승객이 없는지 살핍니다. 이상한 것을 발견하면 본 것을 기장과 동료에게 정확하게 전합니다.',
  tasks:[
   {title:'안전을 먼저 확인해요',   text:'출발 전에 비상 장비와 자리를 하나씩 확인해요.'},
   {title:'작은 변화도 알아차려요', text:'평소와 다른 소리나 냄새, 힘들어하는 승객을 먼저 알아봐요.'},
   {title:'정확하게 알려요',      text:'본 것을 기장과 동료에게 그대로 전해요.'},
  ],
  callout:'승무원이 미리 확인해 둔 덕분에, 우리가 하늘에서도 안전하게 있을 수 있어요.',
 },
 secondary:{
  question:'승무원이 가장 먼저 배우는 것은 무엇일까요?',
  answer:'서비스처럼 보이지만 훈련의 중심은 안전입니다. 비상 장비의 위치와 사용법, 비상시 탈출을 돕는 절차, 응급처치를 익힙니다. 기내 점검은 항목이 많아서 정해진 순서대로 해야 빠뜨리는 곳이 없습니다. 또 평소의 소리와 냄새, 승객의 상태를 알고 있어야 달라진 것이 보입니다. 이상하다고 느낀 것은 본 것과 짐작을 나누어 기장에게 보고합니다. 판단하고 결정하는 것은 기장의 몫이기 때문입니다.',
  tasks:[
   {title:'정해진 순서로 점검해요',    text:'항목이 많을수록 순서를 지켜야 빠뜨리지 않습니다.'},
   {title:'이상 신호를 먼저 알아차려요', text:'평소를 알고 있어야 달라진 것이 보입니다.'},
   {title:'본 것과 추정을 나눠 보고해요', text:'결정은 기장이 하므로 본 것을 정확히 전해야 합니다.'},
  ],
  callout:'승무원이 가장 먼저 배우는 것은 서비스가 아니라 안전입니다.',
 },
};

const cooking = {
 elementary:{
  question:'요리사는 어떤 일을 하나요?',
  answer:'재료를 다루어 한 접시를 완성하는 사람입니다. 오늘 들어온 재료가 어떤 상태인지 먼저 보고, 양과 시간을 재어서 늘 같은 맛이 나오도록 만듭니다. 만드는 동안 중간중간 맛을 보고 조금씩 맞춰 갑니다.',
  tasks:[
   {title:'재료를 살펴요',     text:'오늘의 재료가 어떤 상태인지 먼저 봐요.'},
   {title:'정해진 대로 만들어요', text:'양과 시간을 재어서 같은 맛이 나오게 해요.'},
   {title:'맛보고 고쳐요',     text:'중간에 맛을 보고 조금씩 맞춰요.'},
  ],
  callout:'요리사가 매번 확인해 주어서, 우리가 먹는 음식이 늘 같은 맛으로 나와요.',
 },
 secondary:{
  question:'같은 조리법인데 왜 맛이 달라질까요?',
  answer:'재료의 상태와 불의 세기, 팬의 온도와 시간이 매번 조금씩 다르기 때문입니다. 그래서 눈대중 대신 양과 시간을 재어 기록해 두고, 만드는 중간에 맛을 보며 확인합니다. 고칠 때는 한 번에 하나만 바꿉니다. 소금과 불을 동시에 바꾸면 무엇 때문에 달라졌는지 알 수 없기 때문입니다. 온도와 시간은 맛만이 아니라 안전에도 걸린 문제라서 특히 정확하게 지킵니다.',
  tasks:[
   {title:'재료의 상태를 먼저 봐요',  text:'같은 조리법이라도 재료가 다르면 결과가 달라집니다.'},
   {title:'재고 기록해요',        text:'양과 시간을 남겨 두어야 다음에 다시 만들 수 있습니다.'},
   {title:'한 번에 하나만 바꿔요',   text:'여러 개를 함께 바꾸면 무엇 때문인지 알 수 없습니다.'},
  ],
  callout:'한 번에 하나만 바꿔야 무엇이 달라졌는지 알 수 있습니다. 주방에서도 실험실에서와 같습니다.',
 },
};

const fireResponse = {
 elementary:{
  question:'소방관은 어떤 일을 하나요?',
  answer:'불을 끄는 사람으로 알려져 있지만, 불이 난 곳에 들어가기 전에 무엇이 타고 있는지와 어디로 들어가 어디로 나올지를 먼저 정합니다. 불을 끄는 일 말고도 갇힌 사람을 구하고, 다친 사람을 돕고, 평소에는 불이 나지 않도록 건물을 미리 살펴봅니다.',
  tasks:[
   {title:'들어가기 전에 살펴요',       text:'어디에 사람이 있는지, 무엇이 타고 있는지 먼저 확인해요.'},
   {title:'나올 길도 함께 정해요',      text:'들어가는 길만 정하지 않고 빠져나올 길을 같이 정해요.'},
   {title:'서로 어디 있는지 알려요',    text:'짝과 함께 다니면서 자기가 어디 있는지 계속 알려 줘요.'},
  ],
  callout:'소방관이 가장 먼저 하는 일은 불을 끄는 것이 아니라, 들어가도 되는지 확인하는 것입니다.',
 },
 secondary:{
  question:'연기가 보이면 바로 들어가야 할까요?',
  answer:'급할수록 먼저 확인합니다. 무엇이 타고 있느냐에 따라 써야 할 방법이 달라지고, 물을 뿌리면 오히려 위험해지는 것도 있기 때문입니다. 건물의 구조와 안에 남은 사람, 바람의 방향, 빠져나올 길을 확인한 뒤에 들어갑니다. 안에서는 시야가 거의 없어 벽을 짚어 가며 자리를 가늠하고, 정해진 신호와 무전으로 서로의 위치를 계속 알립니다. 혼자 판단해 움직이지 않는 것이 팀 전체를 지키는 방법입니다.',
  tasks:[
   {title:'무엇이 타는지 먼저 봐요',   text:'타는 것이 다르면 꺼야 하는 방법도 달라집니다.'},
   {title:'나올 길을 먼저 정해요',    text:'들어갈 수 있는지는 나올 수 있는지로 정해집니다.'},
   {title:'자기 위치를 계속 알려요',  text:'보이지 않는 곳에서는 서로의 자리가 곧 안전입니다.'},
  ],
  callout:'들어갈 수 있는지는 나올 수 있는지로 정해집니다. 그래서 물러설 때를 정해 두고 들어갑니다.',
 },
};

const policeWork = {
 elementary:{
  question:'경찰관은 어떤 일을 하나요?',
  answer:'도움이 필요한 곳에 가장 먼저 가는 사람입니다. 신고를 받고 현장에 도착하면 다친 사람이 없는지부터 살피고, 무슨 일이 있었는지 여러 사람에게 따로 물어 적습니다. 잃어버린 물건을 찾아 주고, 길을 안전하게 지키고, 사고가 나지 않도록 미리 살피는 일도 합니다.',
  tasks:[
   {title:'한 사람씩 따로 물어요',      text:'함께 이야기하고 나면 기억이 서로 닮아져요.'},
   {title:'답을 정해 주지 않고 물어요',  text:'네가 그랬지 대신 무슨 일이 있었는지 물어요.'},
   {title:'들은 것과 남은 것을 맞춰 봐요', text:'들은 말과 사진이나 물건에 남은 흔적을 함께 봐요.'},
  ],
  callout:'경찰관이 그대로 적어 둔 기록이 있어서, 나중에 억울한 사람이 생기지 않습니다.',
 },
 secondary:{
  question:'목격자가 본 것은 사실일까요?',
  answer:'사람의 기억은 시간이 지나며 조금씩 달라지고, 다른 사람의 말을 들은 뒤에는 그쪽으로 옮겨 가기도 합니다. 그래서 목격자를 따로 만나 각자 본 것만 듣고, 답이 정해진 질문 대신 답을 열어 두는 질문으로 묻습니다. 진술은 그 자체로 결론이 아니라 확인해야 할 단서이므로, 기록이나 영상, 물건에 남은 흔적처럼 사람의 기억과 상관없는 근거와 맞춰 봅니다. 확인된 것과 확인되지 않은 것을 나누어 남기는 것까지가 이 단계의 일입니다.',
  tasks:[
   {title:'각자에게 따로 물어요',      text:'함께 이야기한 뒤의 기억은 서로 닮아 갑니다.'},
   {title:'답을 정해 두고 묻지 않아요', text:'묻는 방식이 답을 만들어 낼 수 있습니다.'},
   {title:'기억과 기록을 맞춰 봐요',    text:'사람의 기억과 상관없는 근거가 있어야 단단해집니다.'},
  ],
  callout:'묻는 방식이 답을 바꿀 수 있습니다. 그래서 무엇을 들었는지와 함께 어떻게 물었는지도 남깁니다.',
 },
};

const nursing = {
 elementary:{
  question:'간호사는 어떤 일을 하나요?',
  answer:'병원에서 환자 곁에 가장 오래 머무는 사람입니다. 열과 맥박처럼 몸의 상태를 알려 주는 값을 때마다 재어 적고, 어제와 오늘이 어떻게 달라졌는지 살핍니다. 약을 줄 때는 누구에게 무엇을 얼마나 주는지 하나씩 확인하고, 달라진 것이 보이면 의사에게 바로 알립니다.',
  tasks:[
   {title:'때마다 재어 적어요',    text:'한 번만 재지 않고 정해진 때마다 재어 남겨요.'},
   {title:'어제와 오늘을 견줘요',  text:'같은 값이라도 달라지고 있는지가 중요해요.'},
   {title:'다음 사람에게 넘겨요',   text:'본 것과 잰 값을 적어서 다음 간호사에게 그대로 전해요.'},
  ],
  callout:'간호사가 하루하루 이어 적어 둔 값 덕분에, 작은 변화도 놓치지 않게 됩니다.',
 },
 secondary:{
  question:'열이 조금 올랐다면 괜찮은 걸까요?',
  answer:'한 번 잰 값만으로는 알기 어렵습니다. 같은 체온이라도 그 사람의 평소보다 높은지, 어제부터 계속 오르고 있는지에 따라 뜻이 달라지기 때문입니다. 그래서 정해진 때마다 재어 흐름으로 보고, 맥박과 호흡, 환자가 말하는 불편함을 함께 놓아 하나의 상태로 설명되는지 살핍니다. 약을 다루는 일에서는 확인 절차를 건너뛰지 않는 것이 전부입니다. 기록은 다음 근무자가 이어 볼 수 있도록 잰 값과 관찰, 자신이 한 처치를 시각과 함께 남깁니다.',
  tasks:[
   {title:'값 하나가 아니라 흐름을 봐요',   text:'같은 값도 오르는 중인지 내려오는 중인지가 다릅니다.'},
   {title:'그 사람의 평소와 견줘요',       text:'기준은 모두에게 같지 않고 사람마다 다릅니다.'},
   {title:'다음 사람이 읽을 수 있게 적어요', text:'기록이 끊기면 변화도 거기서 함께 끊깁니다.'},
  ],
  callout:'한 번 잰 값보다, 이어서 잰 값이 더 많은 것을 말해 줍니다.',
 },
};

const veterinary = {
 elementary:{
  question:'수의사는 어떤 일을 하나요?',
  answer:'말을 하지 못하는 동물을 치료하는 의사입니다. 어디가 아픈지 동물이 말해 줄 수 없기 때문에 움직임과 숨소리, 먹는 양처럼 눈으로 볼 수 있는 것을 꼼꼼히 살핍니다. 함께 사는 사람에게 언제부터 어떻게 달라졌는지 묻고, 그것만으로 모자라면 검사로 확인합니다.',
  tasks:[
   {title:'몸으로 하는 말을 읽어요', text:'움직임과 숨소리, 먹는 양에서 신호를 찾아요.'},
   {title:'언제부터인지 물어요',    text:'함께 사는 사람에게 달라진 때를 물어봐요.'},
   {title:'검사로 확인해요',       text:'눈으로 알 수 없는 것은 검사로 확인해요.'},
  ],
  callout:'수의사의 환자는 아픈 곳을 말해 주지 못합니다. 그래서 더 오래 보아야 합니다.',
 },
 secondary:{
  question:'동물이 말해 주지 않는데 어떻게 알아낼까요?',
  answer:'증상을 직접 들을 수 없으므로 관찰과 전해 들은 말, 검사 결과를 함께 놓고 좁혀 갑니다. 함께 사는 사람의 이야기는 중요한 단서지만 그대로 사실이 되지는 않습니다. 걱정이 큰 쪽으로 기억이 기울 수 있고, 하루 내내 지켜본 것이 아닐 수도 있기 때문입니다. 그래서 언제부터인지, 얼마나 자주인지, 무엇이 달라졌는지를 구체적으로 되묻습니다. 또 같은 모습이라도 종에 따라 정상인 범위가 달라서, 한 종의 기준을 다른 종에 그대로 옮겨 쓰지 않습니다.',
  tasks:[
   {title:'그 종의 정상을 알고 봐요',  text:'한 종의 정상 범위를 다른 종에 옮겨 쓰지 않습니다.'},
   {title:'전해 들은 말은 되물어요',   text:'언제부터 얼마나 자주인지까지 물어야 단서가 됩니다.'},
   {title:'관찰과 검사를 함께 놓아요', text:'보이는 것과 재어 본 것이 같은 방향인지 봅니다.'},
  ],
  callout:'환자가 말해 주지 않을 때 남은 방법은, 더 오래 보고 더 자세히 되묻는 것입니다.',
 },
};

const weatherForecasting = {
 elementary:{
  question:'기상예보관은 어떤 일을 하나요?',
  answer:'앞으로 날씨가 어떨지 미리 알려 주는 사람입니다. 온도와 바람, 구름을 재는 장비에서 값을 모으고, 컴퓨터가 계산한 여러 결과를 함께 봅니다. 날씨는 꼭 그대로 되지 않기 때문에 비가 온다 안 온다로 잘라 말하는 대신, 얼마나 그럴 것 같은지를 함께 알려 줍니다.',
  tasks:[
   {title:'여기저기서 값을 모아요', text:'땅과 하늘, 바다에서 잰 값을 함께 모아요.'},
   {title:'여러 계산을 견줘요',   text:'계산 결과가 하나가 아니라서 서로 비교해요.'},
   {title:'얼마나 그럴지 알려요',  text:'꼭 그렇다고 하지 않고 가능성으로 알려요.'},
  ],
  callout:'예보가 빗나갈 수 있다는 것까지 알려 주는 것도, 예보관이 하는 일입니다.',
 },
 secondary:{
  question:'비 올 확률이 높다는 말은 무슨 뜻일까요?',
  answer:'비슷한 조건이 여러 번 있었을 때 그중 얼마나 비가 왔는지를 뜻합니다. 반드시 온다는 말도, 조금 온다는 말도 아닙니다. 대기는 처음 조건이 아주 조금만 달라도 시간이 갈수록 결과가 크게 벌어지기 때문에, 조건을 조금씩 바꾼 계산을 여러 번 돌려 결과가 모이는지 흩어지는지를 봅니다. 흩어질수록 확신을 낮춰 전합니다. 그래서 한 번 빗나갔다고 계산이 틀렸다고 단정할 수는 없고, 예보와 실제를 오래 모아 견줘야 알 수 있습니다.',
  tasks:[
   {title:'여러 곳에서 잰 값을 모아요', text:'땅과 하늘과 바다에서 온 값이 함께 있어야 시작됩니다.'},
   {title:'조건을 바꿔 여러 번 돌려요', text:'결과가 모이는지 흩어지는지가 확신의 크기입니다.'},
   {title:'확신의 크기까지 전해요',    text:'반드시 온다와 그럴 가능성이 높다는 다른 말입니다.'},
  ],
  callout:'확률은 애매하게 말하는 것이 아니라, 모르는 정도까지 함께 전하는 방법입니다.',
 },
};

const softwareBuilding = {
 elementary:{
  question:'소프트웨어 개발자는 어떤 일을 하나요?',
  answer:'우리가 쓰는 앱과 누리집을 만드는 사람입니다. 사람의 말로 된 이렇게 되면 좋겠다를 컴퓨터가 알아들을 수 있는 순서로 바꿔 적습니다. 만든 다음에는 생각한 대로 움직이는지 직접 눌러 보고, 이상한 곳이 나오면 어디서부터 잘못됐는지 되짚어 갑니다.',
  tasks:[
   {title:'할 일을 순서로 나눠요',   text:'큰 일을 컴퓨터가 할 수 있는 작은 순서로 나눠요.'},
   {title:'이상하면 다시 해 봐요',   text:'어떻게 했을 때 이상해지는지 똑같이 다시 해 봐요.'},
   {title:'고치고 다시 확인해요',    text:'고친 다음 아까 그 방법으로 한 번 더 해 봐요.'},
  ],
  callout:'개발자가 하는 일의 절반은 만드는 것이고, 나머지 절반은 잘못된 곳을 찾는 것입니다.',
 },
 secondary:{
  question:'오류가 났다는 말만으로 고칠 수 있을까요?',
  answer:'고치기 전에 먼저 같은 오류를 다시 일으킬 수 있어야 합니다. 언제나 나는지 어떤 조건에서만 나는지 모르면, 고친 뒤에도 고쳐졌는지 확인할 수 없기 때문입니다. 그래서 어떤 값을 넣었을 때 무엇이 나왔는지를 가장 작은 조건까지 줄여 가며 다시 일으켜 봅니다. 보이는 곳만 덮어 두면 원인은 남아 다른 데서 또 나타나므로, 증상이 아니라 원인을 고칩니다. 고친 뒤에는 그 상황을 검사로 남겨, 같은 문제가 다시 생기면 바로 드러나게 합니다.',
  tasks:[
   {title:'요구를 빠짐없는 순서로 옮겨요', text:'빠뜨린 조건은 그대로 빈 곳이 되어 남습니다.'},
   {title:'다시 일으킬 수 있게 줄여요',   text:'재현되지 않으면 고쳐졌는지도 알 수 없습니다.'},
   {title:'고친 상황을 검사로 남겨요',  text:'같은 문제가 다시 생기면 바로 드러나게 합니다.'},
  ],
  callout:'다시 일으킬 수 없는 문제는 고칠 수도 없습니다. 그래서 고치기 전에 먼저 재현합니다.',
 },
};

const dataAnalysis = {
 elementary:{
  question:'데이터 분석가는 어떤 일을 하나요?',
  answer:'값이 잔뜩 모인 자료에서 무슨 일이 일어나고 있는지 읽어 내는 사람입니다. 흩어져 있는 자료를 한곳에 모아 정리하고, 표와 그림으로 바꿔 한눈에 보이게 만듭니다. 그리고 보이는 대로 말하기 전에 정말 그런지 다른 방법으로 한 번 더 확인합니다.',
  tasks:[
   {title:'흩어진 자료를 모아요',  text:'여기저기 있는 자료를 한곳에 모아 정리해요.'},
   {title:'한눈에 보이게 그려요',  text:'표와 그림으로 바꾸면 흐름이 보여요.'},
   {title:'정말 그런지 확인해요',  text:'보이는 대로 말하기 전에 한 번 더 확인해요.'},
  ],
  callout:'같은 자료라도 어떻게 그리느냐에 따라 전혀 달라 보입니다.',
 },
 secondary:{
  question:'두 가지가 함께 늘었다면 하나가 원인일까요?',
  answer:'함께 움직인다는 것과 하나가 다른 하나를 일으킨다는 것은 다릅니다. 아이스크림이 많이 팔린 날에 물놀이 사고도 늘었다면, 더운 날씨가 둘 다를 끌어올린 것일 수 있습니다. 그래서 둘 다를 움직인 다른 것이 없는지 먼저 찾습니다. 자료 자체도 그대로 믿지 않습니다. 빠진 값이 왜 빠졌는지, 누구에게서만 모인 자료인지에 따라 결론이 달라지기 때문입니다. 그림도 축을 어디서 시작하느냐에 따라 인상이 달라지므로, 보는 사람을 끌고 가지 않는 방식을 고릅니다.',
  tasks:[
   {title:'모으면서 빠진 값을 봐요',    text:'무엇이 왜 빠졌는지가 결론을 바꿉니다.'},
   {title:'끌고 가지 않게 그려요',      text:'축을 어디서 시작하느냐로 느낌이 달라집니다.'},
   {title:'함께 움직임과 원인을 갈라요', text:'둘 다를 끌어올린 다른 것이 있을 수 있습니다.'},
  ],
  callout:'함께 움직인다고 원인은 아닙니다. 그 둘을 갈라내는 것이 이 일의 핵심입니다.',
 },
};

const autoRepair = {
 elementary:{
  question:'자동차 정비원은 어떤 일을 하나요?',
  answer:'자동차가 고장 났을 때 어디가 문제인지 찾아 고치는 사람입니다. 운전한 사람에게 언제 어떤 소리가 났는지 묻고, 직접 들어 보고 만져 보고 장비로도 확인합니다. 고장 난 곳을 찾아 고친 뒤에는 정말 괜찮아졌는지 같은 상황에서 다시 확인합니다.',
  tasks:[
   {title:'언제 그랬는지 물어요',      text:'어떤 상황에서 소리가 났는지 먼저 물어봐요.'},
   {title:'듣고 보고 재어 봐요',       text:'직접 확인한 것과 장비가 알려 준 것을 함께 봐요.'},
   {title:'고친 뒤에 다시 해 봐요',    text:'문제가 나던 상황을 다시 만들어 확인해요.'},
  ],
  callout:'고친 뒤에 같은 상황을 다시 만들어 보기 전까지는, 고쳐졌는지 알 수 없습니다.',
 },
 secondary:{
  question:'소리만 듣고 어디가 고장인지 알 수 있을까요?',
  answer:'같은 소리라도 날 수 있는 곳이 여럿이라 소리 하나로는 정할 수 없습니다. 그래서 언제 나는지부터 좁힙니다. 출발할 때인지 멈출 때인지, 차가운 상태인지 데워진 뒤인지에 따라 후보가 달라지기 때문입니다. 부품을 하나씩 갈아 보며 맞히는 방법은 증상이 사라져도 왜 그랬는지가 남지 않고 비용도 커집니다. 그래서 진단 장비의 기록과 직접 확인한 것을 맞춰 보고, 고친 뒤에는 증상이 나던 조건을 다시 만들어 사라졌는지 확인합니다.',
  tasks:[
   {title:'언제 나는지부터 좁혀요',   text:'상황이 달라지면 후보도 함께 줄어듭니다.'},
   {title:'갈아 보며 맞히지 않아요',  text:'바꿔서 맞히면 왜 그랬는지가 남지 않습니다.'},
   {title:'같은 조건을 다시 만들어요', text:'증상이 나던 상황에서 사라졌는지 확인합니다.'},
  ],
  callout:'바꿔 가며 맞히는 것은 고친 것이 아닙니다. 왜 그랬는지가 남아야 다음에도 고칠 수 있습니다.',
 },
};

const robotics = {
 elementary:{
  question:'로봇공학자는 어떤 일을 하나요?',
  answer:'스스로 움직이는 기계를 만드는 사람입니다. 어떤 일을 시킬지 먼저 정하고, 그 일에 맞게 몸을 설계하고, 어떻게 움직일지를 프로그램으로 적습니다. 만든 로봇은 계획대로 움직이지 않는 일이 많아서 조금씩 고치면서 될 때까지 다시 해 봅니다.',
  tasks:[
   {title:'할 일을 순서로 적어요',    text:'로봇이 할 일을 하나씩 나눠 순서로 적어요.'},
   {title:'실제로 움직여 봐요',      text:'생각대로 안 움직이면 무엇이 달랐는지 찾아요.'},
   {title:'멈추는 법을 먼저 만들어요', text:'빠르게 만들기 전에 멈출 수 있게 해 둬요.'},
  ],
  callout:'로봇은 한 번에 되지 않습니다. 안 되는 이유를 하나씩 줄여 가는 일입니다.',
 },
 secondary:{
  question:'화면에서는 잘 움직였는데 왜 실제로는 안 될까요?',
  answer:'모의실험은 실제를 단순하게 줄인 모형이라, 넣지 않은 것은 처음부터 없는 셈이 됩니다. 바닥의 미끄러움, 부품의 미세한 흔들림, 신호가 늦게 도착하는 시간 같은 것이 그렇습니다. 센서가 알려 주는 값에도 늘 잡음이 섞여 있어서 한 번 읽은 값을 그대로 믿지 않고 여러 번 읽어 다듬습니다. 또 사람 곁에서 움직이는 기계는 잘못될 때를 먼저 정해 둡니다. 멈춰야 하는 조건과 멈추는 방법을 만들고 나서 빠르게 만드는 것이 순서입니다.',
  tasks:[
   {title:'움직임을 조건과 순서로 적어요',   text:'빠뜨린 조건은 그대로 빈 곳이 되어 남습니다.'},
   {title:'모형에 없던 것을 실제에서 찾아요', text:'넣지 않은 조건은 모의실험 안에 존재하지 않습니다.'},
   {title:'멈추는 방법을 먼저 만들어요',  text:'빠르게 만드는 것보다 멈출 수 있는 것이 먼저입니다.'},
  ],
  callout:'모의실험에 넣지 않은 것은 없는 것이 됩니다. 실제로 움직여 보기 전에는 알 수 없습니다.',
 },
};

const environmentalWork = {
 elementary:{
  question:'환경공학기술자는 어떤 일을 하나요?',
  answer:'물과 공기, 땅이 얼마나 깨끗한지 재고 더러워진 것을 되돌리는 방법을 만드는 사람입니다. 장비로 값을 재어 평소와 견주고, 어디에서 온 것인지 흐름을 거슬러 올라가며 찾습니다. 그리고 다시 더러워지지 않도록 처리하는 시설을 설계합니다.',
  tasks:[
   {title:'떠서 재고 적어요',      text:'물을 떠서 재고, 언제 어디서 떴는지 같이 적어요.'},
   {title:'견줄 곳도 함께 재요',    text:'깨끗한 곳도 같이 재야 달라진 것이 보여요.'},
   {title:'어디서 왔는지 따라가요',  text:'물이 흘러온 쪽으로 거슬러 올라가며 찾아요.'},
  ],
  callout:'한 곳에서 한 번 잰 값 하나로는, 무엇이 달라졌는지 알 수 없습니다.',
 },
 secondary:{
  question:'한 번 잰 값으로 오염됐다고 말할 수 있을까요?',
  answer:'말하기 어렵습니다. 같은 자리라도 비가 온 뒤인지, 하루 중 언제인지, 얼마나 깊은 곳에서 떴는지에 따라 값이 달라지기 때문입니다. 그래서 언제 어디서 어떻게 떴는지를 값과 함께 남기고, 사람의 영향이 닿지 않는 지점도 같이 재어 견줍니다. 값이 유난히 높게 나왔다면 원인을 찾기 전에 재는 방법과 장비부터 확인합니다. 원인을 짚을 때는 흐름의 위쪽으로 거슬러 올라가며 재는 지점을 늘려 가고, 확인되지 않은 배출원은 지목하지 않습니다.',
  tasks:[
   {title:'언제 어떻게 떴는지 남겨요', text:'값만 남으면 나중에 견줄 수가 없습니다.'},
   {title:'견줄 지점을 함께 재요',    text:'영향이 닿지 않는 곳이 있어야 기준이 생깁니다.'},
   {title:'흐름을 거슬러 올라가요',    text:'재는 지점을 늘려 가며 위쪽으로 좁혀 갑니다.'},
  ],
  callout:'값이 튀면 먼저 재는 방법을 봅니다. 장비를 확인하기 전에는 원인을 말하지 않습니다.',
 },
};

const reporting = {
 elementary:{
  question:'기자는 어떤 일을 하나요?',
  answer:'무슨 일이 있었는지 직접 확인해서 사람들에게 알리는 사람입니다. 들은 이야기를 그대로 옮기지 않고 정말 그런지 다른 곳에서도 확인합니다. 확인된 것만 기사로 쓰고, 아직 확인하지 못한 것은 확인하지 못했다고 밝혀 적습니다.',
  tasks:[
   {title:'직접 가서 확인해요',    text:'들은 이야기를 그대로 옮기지 않아요.'},
   {title:'다른 곳에서도 확인해요', text:'한 사람의 말만으로는 쓰지 않아요.'},
   {title:'확인된 것만 써요',     text:'아직 모르는 것은 모른다고 밝혀요.'},
  ],
  callout:'빨리 쓰는 것보다 정확하게 쓰는 것이 먼저입니다.',
 },
 secondary:{
  question:'들은 이야기를 그대로 쓰면 왜 안 될까요?',
  answer:'말한 사람에게도 자기 입장이 있고, 잘못 알고 있을 수도 있기 때문입니다. 그래서 서로 이어져 있지 않은 곳에서 같은 사실이 확인되는지 봅니다. 같은 자료를 옮겨 적은 두 곳은 둘이 아니라 하나입니다. 기록이나 문서처럼 사람의 기억과 상관없는 근거가 있으면 더 단단해집니다. 쓸 때는 확인한 사실과 그에 대한 해석을 나누고, 어디까지 확인했는지를 함께 밝힙니다. 잘못 쓴 것이 나중에 드러나면 고치고, 무엇을 고쳤는지도 남깁니다.',
  tasks:[
   {title:'이어지지 않은 곳에서 확인해요', text:'같은 자료를 옮긴 두 곳은 하나와 같습니다.'},
   {title:'어디까지 확인했는지 밝혀요',   text:'확인하지 못한 부분을 감추지 않습니다.'},
   {title:'틀리면 고치고 남겨요',        text:'무엇을 고쳤는지까지 함께 적습니다.'},
  ],
  callout:'같은 자료를 옮겨 적은 두 곳은, 둘이 아니라 하나입니다.',
 },
};

export const JOBS = [
 {id:'electrical-safety', name:'전기안전관리자', category:'industry', experience:'ready',
  featured:true, isNew:false,
  summary:'전기설비를 점검하고 사고를 예방하는 직업',
  thumb:'assets/jobs/electrical-safety.jpg',
  detail:{
   hero:'assets/heroes/electrical-safety-hero.jpg',
   intro:'전기가 안전하게 사용될 수 있도록 설비를 점검하고 사고를 예방하는 직업입니다.',
   note:'이 체험은 중계펌프장 한 사례를 교육용으로 재구성한 것입니다. 실제 현장의 작업허가·안전 절차를 대신하지 않습니다.',
   levels:electricalSafety,
  }},

 {id:'forensic-pathologist', name:'법의관', category:'medical', experience:'preparing',
  experienceLabel:'일부 구현됨',
  previewHref:'case.html', previewLabel:'법의관 사건 접수 체험',
  featured:true, isNew:false,
  summary:'사인을 밝혀 억울함이 남지 않게 하는 의사',
  thumb:'assets/jobs/forensic-pathologist.jpg',
  detail:{
   hero:'assets/heroes/forensic-pathologist-hero.jpg',
   intro:'사람이 왜 세상을 떠났는지 과학으로 확인하고, 밝혀진 사실과 남은 의문을 나누어 기록하는 의사입니다.',
   note:'일부 구현됨 · 관찰 체험 가능. 사건 브리핑, 부검실 이동, 심장 관찰, 전문감정 의뢰·회신과 업무 인계까지 체험할 수 있습니다. 전체 부검과 최종 사인 판단 구간은 추후 추가됩니다. 업무의 성격을 교육용으로 간추린 설명이며, 자격 취득 경로와 법적 절차는 다루지 않았습니다.',
   levels:forensicPathology,
  }},

 {id:'emergency-medical', name:'응급구조사', category:'medical', experience:'preparing',
  featured:true, isNew:false,
  summary:'사람의 생명을 지키는 응급처치 전문가',
  thumb:'assets/jobs/emergency-medical.jpg',
  detail:{
   hero:'assets/heroes/emergency-medical-hero.jpg',
   intro:'갑자기 다치거나 아픈 사람에게 가장 먼저 도착해, 상태를 확인하고 병원까지 안전하게 잇는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 실제 응급처치 지침과 자격 취득 경로는 확인된 범위가 아니어서 다루지 않았습니다. 응급 상황에서는 먼저 119에 신고하세요. 3D 체험은 아직 준비 중입니다.',
   levels:emergencyMedical,
  }},

 {id:'researcher', name:'연구원', category:'science', experience:'preparing',
  featured:true, isNew:false,
  summary:'새로운 지식을 발견하고 미래를 만드는 직업',
  thumb:'assets/jobs/researcher.jpg',
  detail:{
   hero:'assets/heroes/researcher-hero.jpg',
   intro:'아직 모르는 것을 확인할 수 있는 질문으로 바꾸고, 실험으로 하나씩 확인해 나가는 직업입니다.',
   note:'분야마다 연구 방법과 장비가 크게 다릅니다. 이 설명은 여러 분야에 공통으로 적용되는 부분만 교육용으로 간추린 것입니다. 3D 체험은 아직 준비 중입니다.',
   levels:research,
  }},

 {id:'film-director', name:'영상감독', category:'art', experience:'preparing',
  featured:true, isNew:false,
  summary:'이야기로 세상을 표현하는 직업',
  thumb:'assets/jobs/film-director.jpg',
  detail:{
   hero:'assets/heroes/film-director-hero.jpg',
   intro:'보는 사람에게 무엇을 전할지 정하고, 그것이 실제로 전해졌는지 확인하며 장면을 만드는 직업입니다.',
   note:'작품의 종류와 규모에 따라 감독이 맡는 범위가 크게 다릅니다. 이 설명은 장면을 만드는 판단에 초점을 맞춘 교육용 간추림입니다. 3D 체험은 아직 준비 중입니다.',
   levels:filmDirecting,
  }},

 {id:'structural-engineer', name:'건축구조기술자', category:'build', experience:'preparing',
  featured:true, isNew:false,
  summary:'건물이 무너지지 않도록 뼈대를 계산하는 직업',
  thumb:'assets/jobs/structural-engineer.jpg',
  detail:{
   hero:'assets/heroes/structural-engineer-hero.jpg',
   intro:'건물에 걸리는 힘을 빠짐없이 세어 뼈대를 정하고, 알 수 없는 만큼 여유를 남겨 두는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 실제 설계 기준과 안전율, 자격 취득 경로는 확인된 범위가 아니어서 다루지 않았습니다. 건물에 생긴 금이 걱정된다면 전문가의 점검을 받으세요. 3D 체험은 아직 준비 중입니다.',
   levels:structuralEngineering,
  }},

 {id:'security-analyst', name:'사이버보안 분석가', category:'it', experience:'preparing',
  featured:true, isNew:false,
  summary:'침입의 흔적을 찾아 정보를 지키는 직업',
  thumb:'assets/jobs/security-analyst.jpg',
  detail:{
   hero:'assets/heroes/security-analyst-hero.jpg',
   intro:'컴퓨터가 남긴 기록에서 이상한 흔적을 찾아내고, 확인된 사실과 추정을 나누어 알리는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 조직마다 쓰는 도구와 절차가 다르고, 자격 취득 경로는 확인된 범위가 아니어서 다루지 않았습니다. 3D 체험은 아직 준비 중입니다.',
   levels:securityAnalysis,
  }},

 {id:'flight-attendant', name:'항공승무원', category:'service', experience:'preparing',
  featured:true, isNew:false,
  summary:'기내 안전을 책임지고 승객을 돌보는 직업',
  thumb:'assets/jobs/flight-attendant.jpg',
  detail:{
   hero:'assets/heroes/flight-attendant-hero.jpg',
   intro:'기내를 정해진 순서로 점검하고, 달라진 것을 먼저 알아차려 정확하게 전하는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 항공사마다 절차가 다르고, 훈련 내용과 자격 요건은 확인된 범위가 아니어서 다루지 않았습니다. 3D 체험은 아직 준비 중입니다.',
   levels:cabinSafety,
  }},

 {id:'chef', name:'요리사(셰프)', category:'service', experience:'preparing',
  featured:true, isNew:false,
  summary:'재료를 다루어 한 접시를 완성하는 직업',
  thumb:'assets/jobs/chef.jpg',
  detail:{
   hero:'assets/heroes/chef-hero.jpg',
   intro:'매번 달라지는 재료 위에서 같은 맛을 내기 위해, 재고 기록하고 한 번에 하나씩 고쳐 나가는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 조리 온도와 시간, 위생 기준은 확인된 범위가 아니어서 구체적인 수치를 적지 않았습니다. 실제 조리에서는 공인된 식품안전 기준을 따르세요. 3D 체험은 아직 준비 중입니다.',
   levels:cooking,
  }},

 {id:'firefighter', name:'소방관', category:'safety', experience:'preparing',
  featured:false, isNew:true,
  summary:'불을 끄기 전에 들어가도 되는지부터 확인하는 직업',
  icon:'flame',
  thumb:'assets/jobs/firefighter.jpg',
  detail:{
   hero:'assets/heroes/firefighter-hero.jpg',
   intro:'무엇이 타고 있는지와 빠져나올 길을 먼저 확인하고 들어가는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 실제 진압 절차와 훈련 내용, 자격 취득 경로는 확인된 범위가 아니어서 다루지 않았습니다. 불이 난 것을 보면 직접 끄려 하지 말고 먼저 119에 신고하세요. 3D 체험은 아직 준비 중입니다.',
   levels:fireResponse,
  }},

 {id:'police-officer', name:'경찰관', category:'safety', experience:'preparing',
  featured:false, isNew:true,
  summary:'들은 말과 남은 기록을 맞춰 보는 직업',
  icon:'badge',
  thumb:'assets/jobs/police-officer.jpg',
  detail:{
   hero:'assets/heroes/police-officer-hero.jpg',
   intro:'현장에서 들은 말을 단서로 다루고, 확인된 것과 확인되지 않은 것을 나누어 넘기는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 실제 수사 절차와 법적 요건, 자격 취득 경로는 확인된 범위가 아니어서 다루지 않았습니다. 도움이 필요한 상황에서는 112에 신고하세요. 3D 체험은 아직 준비 중입니다.',
   levels:policeWork,
  }},

 {id:'nurse', name:'간호사', category:'medical', experience:'preparing',
  featured:false, isNew:true,
  summary:'때마다 재어 흐름으로 상태를 읽는 직업',
  icon:'pulse',
  thumb:'assets/jobs/nurse.jpg',
  detail:{
   hero:'assets/heroes/nurse-hero.jpg',
   intro:'환자 곁에서 때마다 값을 재어 흐름으로 읽고, 달라진 것을 가장 먼저 알아차리는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 실제 간호 지침과 자격 취득 경로는 확인된 범위가 아니어서 다루지 않았습니다. 몸이 아플 때는 보호자에게 알리고 의료기관의 진료를 받으세요. 3D 체험은 아직 준비 중입니다.',
   levels:nursing,
  }},

 {id:'veterinarian', name:'수의사', category:'medical', experience:'preparing',
  featured:false, isNew:true,
  summary:'말하지 못하는 환자를 관찰로 좁혀 가는 직업',
  icon:'paw',
  thumb:'assets/jobs/veterinarian.jpg',
  detail:{
   hero:'assets/heroes/veterinarian-hero.jpg',
   intro:'증상을 직접 들을 수 없는 환자를 관찰과 되물음, 검사로 좁혀 가며 치료하는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 진료 방법은 종과 상황에 따라 크게 다르고, 자격 취득 경로는 확인된 범위가 아니어서 다루지 않았습니다. 동물이 아파 보이면 직접 약을 주지 말고 동물병원에 데려가세요. 3D 체험은 아직 준비 중입니다.',
   levels:veterinary,
  }},

 {id:'weather-forecaster', name:'기상예보관', category:'science', experience:'preparing',
  featured:false, isNew:true,
  summary:'모르는 정도까지 함께 전하는 직업',
  icon:'cloud',
  thumb:'assets/jobs/weather-forecaster.jpg',
  detail:{
   hero:'assets/heroes/weather-forecaster-hero.jpg',
   intro:'앞으로의 날씨를 확률로 전하며, 얼마나 확신하는지까지 함께 알리는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 실제 예보 절차와 사용하는 계산 모델은 기관마다 달라 다루지 않았습니다. 실제 기상 특보는 공식 기상 기관의 발표를 따르세요. 3D 체험은 아직 준비 중입니다.',
   levels:weatherForecasting,
  }},

 {id:'software-developer', name:'소프트웨어 개발자', category:'it', experience:'preparing',
  featured:false, isNew:true,
  summary:'문제를 다시 일으켜 본 뒤에 고치는 직업',
  icon:'code',
  thumb:'assets/jobs/software-developer.jpg',
  detail:{
   hero:'assets/heroes/software-developer-hero.jpg',
   intro:'사람의 요구를 컴퓨터가 따라갈 수 있는 순서로 바꾸고, 문제를 다시 일으켜 보며 고쳐 가는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 분야와 조직마다 쓰는 언어와 방식이 크게 달라서, 공통되는 부분만 간추렸습니다. 3D 체험은 아직 준비 중입니다.',
   levels:softwareBuilding,
  }},

 {id:'data-analyst', name:'데이터 분석가', category:'it', experience:'preparing',
  featured:false, isNew:true,
  summary:'함께 움직이는 것과 원인을 갈라내는 직업',
  icon:'chart',
  thumb:'assets/jobs/data-analyst.jpg',
  detail:{
   hero:'assets/heroes/data-analyst-hero.jpg',
   intro:'모인 자료에서 흐름을 읽되, 함께 움직이는 것과 원인을 갈라내는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 다루는 자료의 종류에 따라 방법이 크게 다르고, 구체적인 분석 기법과 도구는 확인된 범위가 아니어서 다루지 않았습니다. 3D 체험은 아직 준비 중입니다.',
   levels:dataAnalysis,
  }},

 {id:'auto-mechanic', name:'자동차 정비원', category:'industry', experience:'preparing',
  featured:false, isNew:true,
  summary:'같은 소리에서 원인을 좁혀 가는 직업',
  icon:'car',
  thumb:'assets/jobs/auto-mechanic.jpg',
  detail:{
   hero:'assets/heroes/auto-mechanic-hero.jpg',
   intro:'같은 소리에서 원인을 좁혀 고치고, 고친 뒤 같은 상황을 다시 만들어 확인하는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 차종과 정비 항목마다 절차가 다르고, 자격 취득 경로는 확인된 범위가 아니어서 다루지 않았습니다. 실제 차량 정비는 전문가에게 맡기세요. 3D 체험은 아직 준비 중입니다.',
   levels:autoRepair,
  }},

 {id:'robotics-engineer', name:'로봇공학자', category:'industry', experience:'preparing',
  featured:false, isNew:true,
  summary:'모의실험에 없던 것을 실제에서 찾아내는 직업',
  icon:'robot',
  thumb:'assets/jobs/robotics-engineer.jpg',
  detail:{
   hero:'assets/heroes/robotics-engineer-hero.jpg',
   intro:'스스로 움직이는 기계를 만들고, 모의실험에 넣지 않았던 것을 실제에서 찾아내 고치는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 로봇의 종류에 따라 필요한 지식이 크게 달라서, 공통되는 부분만 간추렸습니다. 3D 체험은 아직 준비 중입니다.',
   levels:robotics,
  }},

 {id:'environmental-engineer', name:'환경공학기술자', category:'build', experience:'preparing',
  featured:false, isNew:true,
  summary:'한 번 잰 값으로 말하지 않는 직업',
  thumb:'assets/jobs/environmental-engineer.jpg',
  detail:{
   hero:'assets/heroes/environmental-engineer-hero.jpg',
   intro:'물과 공기의 상태를 여러 곳에서 재어 견주고, 되돌리는 방법을 설계하는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 실제 측정 기준과 허용 범위는 확인된 범위가 아니어서 수치를 적지 않았습니다. 오염이 의심되면 관할 기관에 알리세요. 3D 체험은 아직 준비 중입니다.',
   levels:environmentalWork,
  }},

 {id:'journalist', name:'기자', category:'art', experience:'preparing',
  featured:false, isNew:true,
  summary:'이어지지 않은 곳에서 확인한 것만 전하는 직업',
  icon:'mic',
  thumb:'assets/jobs/journalist.jpg',
  detail:{
   hero:'assets/heroes/journalist-hero.jpg',
   intro:'들은 이야기를 그대로 옮기지 않고, 서로 이어지지 않은 곳에서 확인된 것만 전하는 직업입니다.',
   note:'업무의 성격을 교육용으로 간추린 설명입니다. 매체와 분야에 따라 취재 방식이 크게 다르고, 언론 관련 제도와 자격 취득 경로는 확인된 범위가 아니어서 다루지 않았습니다. 3D 체험은 아직 준비 중입니다.',
   levels:reporting,
  }},
];

export function categoryOf(id){return CATEGORIES.find(c=>c.id===id)??null;}

// The chips the screens actually draw. A category nothing is filed under is dropped rather
// than offered as a dead end; 전체 is kept because it is how the reader gets back.
export function activeCategories(){
 return CATEGORIES.filter(cat=>cat.id==='all'||JOBS.some(job=>job.category===cat.id));
}

export function findJob(id){return JOBS.find(j=>j.id===id)??null;}

// Every option is opt-in and composes with the rest; an unrecognised group is ignored
// rather than emptying the list, so a stale link can never show a blank screen.
export function filterJobs({category='all',query='',readyOnly=false,only=null,sort='default'}={}){
 const needle=String(query??'').trim().toLowerCase();
 const group={featured:j=>j.featured,new:j=>j.isNew}[only]??(()=>true);
 const found=JOBS.filter(job=>{
  if(category&&category!=='all'&&job.category!==category)return false;
  if(readyOnly&&job.experience!=='ready')return false;
  if(!group(job))return false;
  if(!needle)return true;
  const label=categoryOf(job.category)?.label??'';
  return [job.name,job.summary,label].some(text=>text.toLowerCase().includes(needle));
 });
 return sort==='name'?[...found].sort((a,b)=>a.name.localeCompare(b.name,'ko')):found;
}

export function levelText(job,level){return job?.detail?.levels?.[level]??null;}
