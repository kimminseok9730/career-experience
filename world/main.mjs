import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createRelayPumpStationState } from '../runtime/plant.js';
import { facts } from './facts.mjs';
import {move,look,canStand,cameraMovement} from './navigation.mjs';
import { STATIONS } from '../core/round.mjs';
import { mountRound } from '../ui.mjs';
import { aimLabel } from './aim-label.mjs';
import { createEquipment } from './equipment.mjs';
import { createExitSign } from './signage.mjs';
import { hmiView,drawHmi } from './hmi.mjs';
const $=id=>document.getElementById(id);
const scene=new T.Scene();scene.background=new T.Color('#bec8c7');scene.fog=new T.Fog('#bec8c7',35,85);
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
document.body.prepend(renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','3D 현장 — 드래그하여 시점 이동');
const camera=new T.PerspectiveCamera(68,innerWidth/innerHeight,.06,100);
const hemi=new T.HemisphereLight('#dceaf0','#807865',1.15);scene.add(hemi);
const sun=new T.DirectionalLight('#fff3d7',3);sun.position.set(4,12,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:14,bottom:-14,near:.5,far:45});sun.shadow.bias=-.0004;scene.add(sun);
const mesh=(g,m,p=[0,0,0],parent=scene)=>{let o=new T.Mesh(g,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
const material=(color,metalness=0,roughness=.75)=>new T.MeshStandardMaterial({color,metalness,roughness});
let seed=78;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function concreteTexture(floor=false){
 const c=document.createElement('canvas');c.width=c.height=512;let ctx=c.getContext('2d');ctx.fillStyle=floor?'#778580':'#b5b6ad';ctx.fillRect(0,0,512,512);
 for(let i=0;i<32000;i++){let v=random()>.5?'255,255,240':'45,51,43';ctx.fillStyle='rgba('+v+','+(random()*.065)+')';ctx.fillRect(random()*512,random()*512,1+random()*3,1+random()*3)}
 ctx.strokeStyle=floor?'#56635b':'#92968c';ctx.lineWidth=1;ctx.strokeRect(1,1,510,510);
 if(!floor)for(const x of [24,488])for(const y of [24,256,488]){ctx.fillStyle='#91958d';ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill()}
 let t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(floor?6:3,floor?6:2);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}
const wallmat=material('#fff');wallmat.map=concreteTexture();wallmat.bumpMap=wallmat.map;wallmat.bumpScale=.018;
const floormat=material('#dce0d5',.12,.57);floormat.map=concreteTexture(true);floormat.bumpMap=floormat.map;floormat.bumpScale=.009;
const steel=material('#adb8b7',.7,.3),black=material('#252d30',.35,.55),blue=material('#24586d',.5,.37),yellow=material('#e1ac29',.3,.38),white=material('#d4d8d1',.25,.4),rust=material('#655b4b');
const box=(s,p,m=wallmat,parent=scene)=>mesh(new T.BoxGeometry(...s),m,p,parent);
const cylinder=(r,h,p,m=steel,parent=scene)=>mesh(new T.CylinderGeometry(r,r,h,24),m,p,parent);
function rod(a,b,r=.024,m=steel,parent=scene){
 let va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.clone().sub(va);
 let o=cylinder(r,d.length(),va.add(vb).multiplyScalar(.5).toArray(),m,parent);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;
}
function plaque(text,w,h,p,{bg='#eceee5',fg='#243332',parent=scene,size=180}={}){
 const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);let ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle=fg;ctx.lineWidth=4;ctx.strokeRect(4,4,c.width-8,c.height-8);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold '+size+'px Malgun Gothic, sans-serif';const lines=text.split('\n');lines.forEach((s,i)=>ctx.fillText(s,512,c.height*(i+1)/(lines.length+1),960));
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}),p,parent);
}
const interact=[];
function target(o,title,description){
 const station=title==='전기실 출입문'?'entry':title==='운전감시 HMI'?'hmi':title==='MCC-P'?'mcc':title==='UPS'?'ups':title.includes('토출밸브')?'field':null;
 o.userData.inspect={title,description,station};if(station)interact.push(o);return o;
}
// Shell, metres. Floor elevation relative to upper gallery; internal dimensions are reconstructed.
box([8.8,.35,2.6],[0,-.175,-3.65],floormat);box([8.8,.35,2.1],[0,-.175,3.9],floormat);
box([2.45,.35,4.85],[-3.175,-.175,-.275],floormat);box([2.45,.35,4.85],[3.175,-.175,-.275],floormat);
box([3.9,.35,2.8],[0,-.175,-1.25],floormat);
box([.3,4.8,9.9],[-4.25,2.4,0]);box([.3,4.8,9.9],[4.25,2.4,0]);box([8.8,4.8,.3],[0,2.4,-4.8]);
box([6.35,4.8,.3],[-1.225,2.4,4.8]);box([.85,4.8,.3],[3.975,2.4,4.8]);box([1.6,1.9,.3],[2.75,3.85,4.8]);box([8.8,.22,9.9],[0,4.9,0]);
for(const x of [-3.95,3.95])for(const z of [-4.5,0,4.5])box([.36,4.8,.4],[x,2.4,z]);
for(const z of [-2.5,2.8])box([8.2,.4,.3],[0,4.58,z]);
// Lower wet well structure, enclosed below floor.
box([.25,12,2.8],[-2.075,-6,1.5]);box([.25,12,2.8],[2.075,-6,1.5]);box([4.3,12,.25],[0,-6,.025]);box([4.3,12,.25],[0,-6,2.975]);box([4.3,.3,3.2],[0,-12,1.5]);
const water=mesh(new T.PlaneGeometry(3.9,2.7,24,20),new T.MeshStandardMaterial({color:'#334f48',roughness:.25,metalness:.5,transparent:true,opacity:.9}),[0,-8,1.5]);water.rotation.x=-Math.PI/2;
// Glass partition between dry electrical room and gallery. Walk-through door.
for(const [x,w]of [[-1.65,4.9],[3.18,1.85]]){
 box([w,1.02,.14],[x,.51,-2.57]);box([w,.12,.14],[x,3.02,-2.57],steel);
 const glass=box([w,1.9,.035],[x,2,-2.57],new T.MeshPhysicalMaterial({color:'#b5ced0',transparent:true,opacity:.16,roughness:.2,depthWrite:false}));glass.castShadow=false;
 for(let xx=x-w/2;xx<=x+w/2+.01;xx+=w/3)box([.045,2,.06],[xx,2,-2.57],steel);
}
box([1.45,.4,.15],[1.525,3.1,-2.57],steel);plaque('전기실',.9,.25,[1.525,3.12,-2.475]);
plaque('기계실',1.25,.36,[-.3,3.8,-2.46]);plaque('관계자 외 출입금지',1.35,.24,[2.75,3.43,4.97]);
for(const [z,angle] of [[2.92,0],[2.915,Math.PI]]){
 const caution=plaque('흡수정  |  추락 주의',1.1,.22,[0,.68,z],{bg:'#dfb442',fg:'#302c23'});
 caution.rotation.y=angle;caution.material.side=T.FrontSide;
}
// Rails with continuous top and mid bars, toe plates, bolted footplates.
function rail(a,b){
 rod([a[0],1.12,a[1]],[b[0],1.12,b[1]],.027);rod([a[0],.6,a[1]],[b[0],.6,b[1]],.022);
 const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/.9);
 for(let i=0;i<=n;i++){let x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n;rod([x,.05,z],[x,1.14,z],.027);box([.14,.025,.14],[x,.025,z],steel);for(const dx of [-.05,.05])for(const dz of [-.05,.05])cylinder(.008,.03,[x+dx,.04,z+dz],black)}
 rod([a[0],.12,a[1]],[b[0],.12,b[1]],.035,yellow);
}
rail([-1.98,.13],[1.98,.13]);rail([-1.98,2.88],[1.98,2.88]);rail([-1.98,.13],[-1.98,2.88]);rail([1.98,.13],[1.98,2.88]);
// Painted walkway lines, drainage channels.
for(const x of [-2.42,2.42]){box([.045,.005,5.9],[x,.006,.1],yellow);box([.18,.012,6],[x+Math.sign(x)*.75,.008,.1],black);for(let z=-2.8;z<3.1;z+=.12)box([.16,.013,.013],[x+Math.sign(x)*.75,.018,z],steel)}
box([7.7,.005,.045],[0,.006,3.6],yellow);
// Cabling trays, hangers and bundled conductors.
function tray(x,z,len){
 for(const dx of [-.22,.22])box([.04,.1,len],[x+dx,3.8,z],steel);
 for(let zz=z-len/2;zz<z+len/2;zz+=.25)box([.46,.02,.032],[x,3.76,zz],steel);
 for(let xx=x-.15;xx<x+.16;xx+=.045)rod([xx,3.81,z-len/2],[xx,3.81,z+len/2],.019,black);
 for(let zz=z-len/2+.3;zz<z+len/2;zz+=1.8){rod([x-.24,3.73,zz],[x-.24,4.8,zz],.012);rod([x+.24,3.73,zz],[x+.24,4.8,zz],.012)}
}
tray(-3.35,.05,8.8);tray(3.35,.05,8.8);
// Strip luminaires and local illumination.
for(const x of [-2.7,2.7])for(const z of [-3.5,-.9,2.8]){
 box([.17,.07,1.25],[x,4.28,z],steel);box([.12,.02,1.18],[x,4.23,z],new T.MeshStandardMaterial({color:'#fff5da',emissive:'#fff5da',emissiveIntensity:3}));
 const l=new T.PointLight('#fff4db',15,9,2);l.position.set(x,3.85,z);scene.add(l);
 rod([x,4.31,z-.45],[x,4.8,z-.45],.009);rod([x,4.31,z+.45],[x,4.8,z+.45],.009);
}
// Electrical cubicles with physical door seams, latches, vents, displays, signal lamps.
let signals=[],panelDisplays=[];
function cabinet(name,x,width,depth=.6,desc='외관과 표시등을 관찰하십시오.'){
 const g=new T.Group();g.position.set(x,0,-4.26);scene.add(g);box([width,2.35,depth],[0,1.175,0],white,g);box([width+.035,.09,depth+.02],[0,.045,0],black,g);
 const cols=name==='MCC-P'?3:1;
 for(let col=0;col<cols;col++){
 const cw=width/cols,px=-width/2+cw*(col+.5),front=depth/2+.008;
 let door=box([cw-.017,2.18,.025],[px,1.19,front],white,g);target(door,name,desc);
 for(const y of [.45,1.85])box([.025,.085,.018],[px-cw/2+.023,y,front+.019],steel,g);
 box([.028,.18,.035],[px+cw/2-.055,1.15,front+.039],black,g);
 box([.25,.21,.025],[px,1.87,front+.03],black,g);
 const lcd=plaque('운전 상태',.225,.14,[px,1.87,front+.047],{bg:'#223d49',fg:'#bfe3cb',parent:g,size:130});
 if(name==='MCC-P')panelDisplays.push(lcd);
 plaque(cols===3?'PM-103 '+String.fromCharCode(65+col):name,cw-.07,.1,[px,2.21,front+.023],{parent:g,size:78});
 for(let k=0;k<3;k++){let ma=new T.MeshStandardMaterial({color:k===0?'#4bba76':k===1?'#ab382b':'#d4a92d',emissive:k===0?'#226c39':'#000',emissiveIntensity:.7});let lamp=cylinder(.021,.025,[px+(k-1)*.085,1.55,front+.04],ma,g);lamp.rotation.x=Math.PI/2;if(name==='MCC-P'&&k===0)signals.push(lamp)}
 box([.13,.16,.025],[px,1.27,front+.03],black,g);box([.045,.09,.035],[px,1.27,front+.053],steel,g);
 for(let y=.24;y<.58;y+=.028)box([cw-.12,.008,.006],[px,y,front+.027],black,g);
 }
 rod([0,2.35,0],[0,3.7,0],.035,black,g);return g;
}
cabinet('LV-P',-3.5,facts.lvP.widthM,facts.lvP.depthM,'LV-P 수전반. 공개 외형치수 800 × 2350 × 800 mm.');
const equipment=createEquipment({scene,box,cylinder,rod,plaque,material,target});
equipment.cabinet('MCC-P',-1.98,facts.mccP.widthM,facts.mccP.depthM,'mcc');
cabinet('PLC',-.5,.62,.6,'중계펌프장 제어·감시용 PLC. 현장 경보와 전원 상태를 대조합니다.');
equipment.cabinet('UPS',.28,.7,.65,'ups');
cabinet('LP-P',1.13,.65,.55,'조명·보조부하용 분전반.');
// Desk and active HMI in electrical room, visible through glazing.
box([1.05,.065,.6],[2.9,.77,-3.92],white);for(const x of [2.45,3.35])for(const z of [-4.13,-3.72])box([.035,.76,.035],[x,.38,z],steel);
box([.56,.34,.06],[2.9,1.12,-3.94],black);box([.06,.19,.06],[2.9,.89,-3.94],black);box([.35,.014,.13],[2.9,.81,-3.7],black);
const hmicanvas=document.createElement('canvas');hmicanvas.width=1024;hmicanvas.height=640;const hmiTex=new T.CanvasTexture(hmicanvas);hmiTex.colorSpace=T.SRGBColorSpace;
const screen=mesh(new T.PlaneGeometry(.51,.29),new T.MeshBasicMaterial({map:hmiTex}),[2.9,1.12,-3.902]);target(screen,'운전감시 HMI','수위, 펌프 운전, MCC 및 UPS 상태를 확인하고 점검 기록에 남깁니다.');
// Pipework with flanges and real round fittings.
function flange(p,axis='z'){
 let g=new T.Group();g.position.set(...p);if(axis==='x')g.rotation.z=-Math.PI/2;else if(axis==='z')g.rotation.x=Math.PI/2;scene.add(g);
 cylinder(.145,.044,[0,0,0],steel,g);for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(.014,.07,[Math.cos(a)*.117,0,Math.sin(a)*.117],black,g)}
}
function wheel(p){
 const g=new T.Group();g.position.set(...p);scene.add(g);let tor=mesh(new T.TorusGeometry(.15,.016,8,32),blue,[0,0,0],g);tor.rotation.x=Math.PI/2;
 for(let i=0;i<4;i++){let a=i*Math.PI/2;rod([0,0,0],[Math.cos(a)*.15,0,Math.sin(a)*.15],.011,blue,g)}
}
for(const [i,x]of [-1.45,0,1.45].entries()){
 let g=new T.Group();g.position.set(x,-10.8,1.5);scene.add(g);
 cylinder(.29,.72,[0,.6,0],black,g);cylinder(.4,.28,[0,.16,0],black,g);cylinder(.23,.13,[0,1.025,0],steel,g);
 for(let k=0;k<10;k++){let a=k*Math.PI/5;box([.04,.55,.045],[Math.cos(a)*.29,.6,Math.sin(a)*.29],black,g)}
 rod([x,-10.5,1.5],[x,.78,1.5],.075,steel);rod([x,1,1.28],[x,1,-.9],.075,steel);
 const bendPoints=[];for(let k=0;k<=16;k++){const a=k/16*Math.PI/2;bendPoints.push(new T.Vector3(x,.78+.22*Math.sin(a),1.28+.22*Math.cos(a)))}
 mesh(new T.TubeGeometry(new T.CatmullRomCurve3(bendPoints),20,.075,16,false),steel);
 // Rounded elbow at top of riser, flange, handwheel.
 rod([x,1,-.9],[x+.18,1,-.9],.075,steel);
 for(const z of [-.45,.55,1.25])flange([x,1,z]);let valve=cylinder(.125,.2,[x,1,-.35],blue);valve.rotation.x=Math.PI/2;
 rod([x,1,-.35],[x,1.4,-.35],.035,blue);wheel([x,1.43,-.35]);target(valve,'PM-103 '+String.fromCharCode(65+i)+' 토출밸브','펌프 토출측 배관·밸브의 누수와 외관을 관찰합니다. 펌프 정격: 37 kW, 3.2 m³/min, 36 mH.');
 plaque('PM-103 '+String.fromCharCode(65+i),.35,.11,[x,1.67,-.23],{bg:'#edf0e5',size:90});
 // Guide rails and lifting chains.
 for(const dx of [-.21,.21])rod([x+dx,-11,1.65],[x+dx,-.05,1.65],.018);
 rod([x,-10,1.65],[x,0,1.65],.011,black);
}
rod([-2.1,1,-.9],[2.05,1,-.9],.11,steel);for(const x of [-1.9,-.75,.7,1.85])flange([x,1,-.9],'x');
for(const x of [-2.05,.8]){box([.28,.05,.28],[x,.035,-.9],steel);rod([x,.05,-.9],[x,.9,-.9],.045,steel)}
// Air vessel and compressor group.
cylinder(.34,1.6,[-3.5,1.02,.75],steel);mesh(new T.SphereGeometry(.34,24,12),steel,[-3.5,1.82,.75]).scale.y=.42;
for(const z of [.55,.95])box([.07,.22,.07],[-3.5,.13,z],steel);
rod([-3.5,.8,.75],[-2.2,.8,.75],.035,steel);const dial=cylinder(.085,.025,[-3.5,1.55,1.105],black);dial.rotation.x=Math.PI/2;
plaque('0.0\nMPa',.13,.13,[-3.5,1.55,1.125],{size:190});plaque('PM-104',.4,.13,[-3.5,1.23,1.097],{size:110});
let tank=cylinder(.19,.85,[-3.47,.35,2],blue);tank.rotation.x=Math.PI/2;box([.32,.3,.44],[-3.47,.67,2],black);for(const z of [1.7,2.3])box([.42,.04,.1],[-3.47,.13,z],black);
// I-section rail and electric chain hoist.
box([8,.065,.32],[0,3.42,1.5],yellow);box([8,.3,.06],[0,3.6,1.5],yellow);box([8,.065,.32],[0,3.78,1.5],yellow);
box([.58,.26,.46],[-1.45,3.21,1.5],black);cylinder(.16,.48,[-1.45,2.98,1.5],yellow).rotation.z=Math.PI/2;
rod([-1.45,2.84,1.5],[-1.45,2.01,1.5],.013,black);
let hook=mesh(new T.TorusGeometry(.085,.02,10,24,Math.PI*1.6),steel,[-1.45,1.96,1.5]);hook.rotation.z=.8;
plaque('1 t',.42,.16,[.3,3.63,1.535],{bg:'#e1ac29',size:180});
// Ladder behind rail into well, not a player path.
for(const x of [1.55,1.85])rod([x,-11,2.6],[x,.5,2.6],.023);
for(let y=-10.8;y<.5;y+=.3)rod([1.55,y,2.6],[1.85,y,2.6],.018);
// Conduit bends, extinguisher and exit signs.
for(const z of [-1.8,3.8]){rod([4.02,.3,z],[4.02,4.2,z],.018);box([.06,.19,.14],[4,.95,z],steel)}
cylinder(.085,.4,[3.78,.31,4.35],material('#ae3024'));box([.11,.05,.08],[3.78,.55,4.35],black);
const extinguisherSign=plaque('소화기',.22,.28,[3.77,1.05,4.45],{bg:'#aa3327',fg:'#fff',size:170});extinguisherSign.rotation.y=Math.PI;extinguisherSign.material.side=T.FrontSide;
scene.add(createExitSign());
const exitCaption=plaque('비상구',.28,.05,[2.75,2.962,4.548],{bg:'#087c49',fg:'#efffe8',size:130});exitCaption.rotation.y=Math.PI;exitCaption.material.side=T.FrontSide;
// Exterior arrival courtyard.
box([15,.2,9],[0,-.13,9],material('#838c88',.05,.95));box([100,.1,100],[0,-.28,0],material('#66715b'));
for(const x of [-6.6,6.6])for(let z=5.3;z<13;z+=1.7){rod([x,0,z],[x,1.4,z],.035);rod([x,1.2,z],[x,1.2,Math.min(z+1.7,13)],.022)}
for(const x of [-5,5]){
 box([.8,.35,3.3],[x,.12,9],wallmat);
 for(let z=7.6;z<10.5;z+=.38)for(const dx of [-.17,.17]){
  const shrub=mesh(new T.SphereGeometry(.31,12,8),material(random()>.5?'#506344':'#627a4f'),[x+dx,.52+random()*.1,z]);shrub.scale.y=1.35;
 }
}
box([9,.24,1.3],[0,3.0,5.3],white);for(const x of [-4.1,4.1])box([.1,3,.1],[x,1.5,5.8],steel);
plaque('중계펌프장',2.5,.45,[-1.0,2.35,4.96],{bg:'#e1e2d4',fg:'#273931',size:125});
// Open steel access door, weather sill and ventilation louvres.
const access=equipment.door(scene,{x:2.03,y:.04,z:4.81,w:1.44,h:2.74,id:'access',station:'entry',angle:Math.PI/2});
for(const x of [1.99,3.51])box([.075,2.83,.16],[x,1.415,4.81],steel);
box([1.6,.075,.16],[2.75,2.82,4.81],steel);
plaque('중계펌프장\n관계자 외 출입금지',.85,.25,[.72,1.95,.026],{parent:access.leaf,bg:'#d9ded6',size:95});
box([1.6,.025,.33],[2.75,.005,4.8],steel);
for(const x of [-2.7,.2]){
 box([1.75,.72,.09],[x,3.93,4.98],black);
 for(let y=3.64;y<4.24;y+=.075){let slat=box([1.68,.055,.08],[x,y,5.025],steel);slat.rotation.x=.38}
}
for(const x of [-4.02,4.02]){
 rod([x,.05,5.0],[x,4.75,5.0],.043,steel);
 box([.25,.13,.22],[x,2.7,5.1],black);
}
for(let i=0;i<5;i++){
 const x=-24+i*11,h=4+(i%3);const facade=material(i%2?'#969e97':'#aab0a6');
 box([6,h,7],[x,h/2,-21],facade);
 for(const dx of [-1.55,1.55])for(const y of [1.4,3.1]){
  box([1.3,.85,.035],[x+dx,y,-17.48],material('#485b60',.3,.28));
  box([.035,.86,.045],[x+dx,y,-17.45],steel);box([1.31,.035,.045],[x+dx,y,-17.45],steel);
 }
 const roofmat=material('#687775',.15,.7);
 const a=box([3.2,.14,7.4],[x-1.52,h+.25,-21],roofmat);a.rotation.z=.16;
 const b=box([3.2,.14,7.4],[x+1.52,h+.25,-21],roofmat);b.rotation.z=-.16;
}
// Shared state model: no independent fake pump state in this renderer.
let state=createRelayPumpStationState(),diagnosticVariant=null,hmiPage=0,activeRecovery=null;
function currentHmi(){return hmiView(state,diagnosticVariant,hmiPage,activeRecovery);}
function refreshHmi(){drawHmi(hmicanvas,currentHmi());hmiTex.needsUpdate=true;}
const korean={running:'운전',stopped:'정지',faulted:'고장',isolated:'격리'};
function updateState(){
 equipment.update(state);
 const alarms={none:'정상', 'high-water':'고수위 경보','pump-fault':'B 펌프 고장','power-loss':'MCC 전원 상실'};
 $('alarm').textContent=alarms[state.alarm];$('alarm').style.color=state.alarm==='none'?'#b8d5a3':'#ffaf83';
 $('readings').textContent='A '+korean[state.pumps['PM-103-A']]+' · B '+korean[state.pumps['PM-103-B']]+' · C '+korean[state.pumps['PM-103-C']];
 refreshHmi();
 panelDisplays.forEach((lcd,i)=>{
  const map=lcd.material.map,c=map.image.getContext('2d');
  c.fillStyle='#203b47';c.fillRect(0,0,map.image.width,map.image.height);
  c.fillStyle='#c6e9d3';c.textAlign='center';c.textBaseline='middle';c.font='bold 140px Malgun Gothic';
  c.fillText(korean[state.pumps['PM-103-'+String.fromCharCode(65+i)]],512,map.image.height/2);map.needsUpdate=true;
 });
}
updateState();
let player={x:2.85,z:3.6,yaw:.47,pitch:-.09},keys=new Set(),drag=null,locked=false;
const modal=()=>!!document.querySelector('dialog[open]');
const experience=mountRound({
 setVariant(variant){equipment.setVariant(variant);if(diagnosticVariant!==variant){diagnosticVariant=variant;hmiPage=0;refreshHmi();}},
 setRecovery(recovery){if(activeRecovery?.stage!==recovery?.stage)hmiPage=0;activeRecovery=recovery??null;equipment.setVariant(recovery&&recovery.stage!=='review'?null:diagnosticVariant);refreshHmi();},
 enclosuresClosed(){return equipment.doors.filter(d=>d.station==='mcc').every(d=>!d.open&&Math.abs(d.current)<.03);},
 setWorkflow(status,recoveryStage){$('workflowStatus').textContent=recoveryStage?({review:'복구 검토 · B 정지',ready:'시험 승인 접수 · B 정지',trial:'B 시험운전 · 설치계기 확인',stopped:'B 시험 중지 · 재확인 대기',verified:'시험 결과 확인 · 최종 인계 대기'})[recoveryStage]:({investigating:'추가 확인 진행',returned:'점검 요청: 보완 필요 · B 정지 유지',accepted:'전문 점검 접수 · B 재기동 보류',handedoff:'전문 점검 회신 도착 · 복구 작업 대기'})[status]??'';},
 captureEvidence(){renderer.render(scene,camera);const photo=document.createElement('canvas');photo.width=Math.min(900,canvas.width);photo.height=Math.round(canvas.height*photo.width/canvas.width);photo.getContext('2d').drawImage(canvas,0,0,photo.width,photo.height);return photo.toDataURL('image/jpeg',.68);},
 setPlant(next){state=next;updateState();water.position.y=state.waterLevelM-12;},
 pause(){keys.clear();drag=null;document.exitPointerLock?.();},
 focus(){canvas.focus();},
 reset(){player={x:2.85,z:3.6,yaw:.47,pitch:-.09};keys.clear();equipment.reset();hmiPage=0;refreshHmi();},
 goTo(id){const position=STATIONS[id]?.position;if(position&&canStand(position.x,position.z)){player={...position};keys.clear();drag=null;canvas.focus();}},
});
$('lock').onclick=async()=>{canvas.focus();try{await canvas.requestPointerLock?.()}catch{ $('inputHint').textContent='드래그 시점으로 조작 중 · 방향키도 사용 가능'}};
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;$('inputHint').textContent=locked?'마우스로 둘러보기 · Esc 잠금 해제':'마우스를 누른 채 드래그하여 둘러보기';keys.clear();drag=null});
canvas.addEventListener('pointerdown',e=>{canvas.focus();if(e.button!==0||locked)return;drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(modal())return;if(locked){player=look(player,e.movementX,e.movementY)}else if(drag){player=look(player,e.clientX-drag.x,e.clientY-drag.y);drag={x:e.clientX,y:e.clientY}}});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
window.addEventListener('blur',()=>{keys.clear();drag=null});document.addEventListener('visibilitychange',()=>keys.clear());
let aimed=null;
let magnified=false;
function inspect(back=false){if(!aimed||modal())return;if(aimed.station==='hmi'){const view=currentHmi();hmiPage=(view.page+(back?-1:1)+view.pageCount)%view.pageCount;refreshHmi();canvas.focus();return;}if(aimed.door){if(aimed.station==='mcc'&&['trial','verified'].includes(activeRecovery?.stage))return;aimed.door.open=!aimed.door.open;canvas.focus();return;}magnified=!magnified;canvas.focus();}
function diagnose(){if(aimed){const view=currentHmi();if(aimed.station==='hmi'&&view.trialCheck){experience.recordTrialAt(view.trialCheck);return;}experience.diagnosticAt(aimed.station,aimed.station==='hmi'?view.check:null);}}
function record(){if(aimed&&aimed.station!=='entry'&&!modal()){const view=currentHmi();if(aimed.station==='hmi'&&(view.check||view.trialCheck)){diagnose();return;}if(aimed.internal&&aimed.station==='mcc'&&experience.canDiagnose())experience.inspectInternal(aimed.cabinet);else experience.inspect(aimed.station);}}
function zoom(){magnified=!magnified;canvas.focus();}
$('inspectButton').onclick=()=>inspect();
$('recordButton').onclick=record;$('zoomButton').onclick=zoom;
$('diagnosticButton').onclick=diagnose;
addEventListener('keydown',e=>{if(e.code==='KeyQ'&&!e.repeat&&!modal()&&document.activeElement===canvas&&aimed)diagnose();});
addEventListener('keydown',e=>{if(modal()||document.activeElement!==canvas)return;if(['KeyW','KeyA','KeyS','KeyD','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyF','KeyR'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='KeyE')inspect(e.shiftKey);if(e.code==='KeyR')record();if(e.code==='KeyF')zoom();});
addEventListener('keyup',e=>keys.delete(e.code));
// Keep the supplied character at measured scale and out of the near camera.
const armBones=[];
function aimBone(bone,direction){
 const q=bone.getWorldQuaternion(new T.Quaternion());
 const axis=new T.Vector3(0,1,0).applyQuaternion(q);
 const wanted=new T.Quaternion().setFromUnitVectors(axis,direction.normalize()).multiply(q);
 bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(wanted));bone.updateWorldMatrix(false,true);
}
let human=null;new GLTFLoader().load('./vendor/human/human-full.glb',g=>{
 human=g.scene;let bounds=new T.Box3().setFromObject(human),size=bounds.getSize(new T.Vector3());human.scale.multiplyScalar(1.75/size.y);bounds.setFromObject(human);human.position.y=-bounds.min.y;
 const holder=new T.Group();holder.add(human);human=holder;human.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false}});
 human.visible=false;scene.add(human);human.updateWorldMatrix(true,true);
 // Provided model arrives in a posed stance. Relax both upper and lower arms.
 const bones=[];human.traverse(o=>{if(o.isBone)bones.push(o)});
 for(const side of ['L','R'])for(const part of ['upperarm01','lowerarm01']){
  const bone=bones.find(b=>b.name.replace(/[^a-z0-9]/gi,'')===part+side);
  if(bone){aimBone(bone,new T.Vector3(side==='L'?.10:-.10,-1,.05));armBones.push({bone,rest:bone.quaternion.clone()})}
 }
 $('load').textContent='';
},undefined,()=>{$('load').textContent='인체 모델을 불러오지 못했습니다. 현장 탐색은 가능합니다.'});
const ray=new T.Raycaster(),center=new T.Vector2(0,0);let last=performance.now(),frames=0,elapsed=0;
function frame(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;
 if(!modal()){
 const f=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),s=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));
 const delta=cameraMovement(player.yaw,f,s,dt);const candidate=move(player,delta.x,delta.z);if(!equipment.blocked(candidate))player=candidate;
 player=look(player,(Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft')))*dt*320,(Number(keys.has('ArrowDown'))-Number(keys.has('ArrowUp')))*dt*250);
 }
 camera.position.set(player.x,1.67,player.z);camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
 const nextFov=T.MathUtils.damp(camera.fov,magnified?32:68,12,dt);if(Math.abs(camera.fov-nextFov)>.001){camera.fov=nextFov;camera.updateProjectionMatrix();}
 equipment.tick(dt,player);
 if(human){human.position.set(player.x+Math.sin(player.yaw)*.26,0,player.z+Math.cos(player.yaw)*.26);human.rotation.y=player.yaw+Math.PI}
 water.position.y+=(state.waterLevelM-12-water.position.y)*Math.min(1,dt*.6);
 const arr=water.geometry.attributes.position;for(let i=0;i<arr.count;i++)arr.setZ(i,Math.sin(arr.getX(i)*5+now*.001)*.009+Math.cos(arr.getY(i)*7+now*.0013)*.009);arr.needsUpdate=true;
 camera.updateMatrixWorld();scene.updateMatrixWorld();
 ray.setFromCamera(center,camera);
 const hit=ray.intersectObjects(interact,false).find(h=>{const data=h.object.userData.inspect;if(h.distance>2.7||data.internal&&Math.abs(data.door.current)<.65)return false;return data.station==='entry'?player.z>2.5:data.station==='field'?player.z> -2.5:player.z< -2.79;});
 aimed=experience.canInspect()&&!modal()?(hit?.object.userData.inspect??null):null;
 const targetText=aimLabel(aimed);
 const trialLocked=aimed?.station==='mcc'&&aimed?.door&&['trial','verified'].includes(activeRecovery?.stage);
 $('inspectButton').textContent=trialLocked?'시험·운전 중 문 조작 잠금':aimed?.station==='hmi'?'HMI 다음 화면 · E':aimed?.door?(aimed.door.stuck?'문이 막힘 · 물러나기':aimed.door.open?'문 닫기 · E':'문 열기 · E'):'자세히 보기 · E';
 $('recordButton').disabled=!aimed||aimed.station==='entry';
 $('diagnosticButton').disabled=!experience.canDiagnose()||!aimed||!['hmi','mcc'].includes(aimed.station);
 $('zoomButton').textContent=magnified?'시야 복귀 · F':'자세히 보기 · F';
 if($('target').textContent!==targetText)$('target').textContent=targetText;
 $('inspectButton').disabled=!aimed||!!trialLocked;
 const zoneText=player.z>4.8?'외부 · 진입 마당':player.z< -2.57?'전기실 · 제어 구역':'기계실 · 배관 갤러리';
 if($('zone').textContent!==zoneText)$('zone').textContent=zoneText;
 renderer.render(scene,camera);frames++;elapsed+=dt;
 if(elapsed>.5){$('metrics').textContent='현장 '+player.x.toFixed(1)+' / '+player.z.toFixed(1)+' m · 시점 '+(player.yaw*180/Math.PI).toFixed(0)+'°';elapsed=0}
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
