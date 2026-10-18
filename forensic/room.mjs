import * as T from '../vendor/three.module.js';
import {clothMaterial} from './materials.mjs';
import {roomMaterials} from './room-materials.mjs';
export const SPECIMEN_ORIGIN=new T.Vector3(1.28,1.235,.1);
export function createRoom(){
 const root=new T.Group();
 const m=(color,metalness=0,roughness=.6)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const {steel,wall,floor}=roomMaterials();
 const dark=m('#3a484b'),rubber=m('#303b3d'),white=m('#dbe1db'),cloth=clothMaterial();
 function mesh(geo,mat,pos){const o=new T.Mesh(geo,mat);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;}
 function box(s,pos,mat=steel){
  if(mat!==steel||Math.min(...s)<.025)return mesh(new T.BoxGeometry(...s),mat,pos);
  const bevel=Math.min(.009,Math.min(...s)*.16),w=s[0]-2*bevel,h=s[1]-2*bevel,d=s[2]-2*bevel;
  const shape=new T.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w/2,h/2);shape.lineTo(-w/2,h/2);shape.closePath();
  const geometry=new T.ExtrudeGeometry(shape,{depth:d,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:1});geometry.translate(0,0,-d/2);
  return mesh(geometry,mat,pos);
 }
 const cyl=(r,h,pos,mat=steel)=>mesh(new T.CylinderGeometry(r,r,h,40),mat,pos);
 const rod=(points,r=.016,mat=steel)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false),mat,[0,0,0]);
 function plate(text,pos,w=.7,h=.2,bg='#d7dfdb',ink='#2d4143'){
  const canvas=document.createElement('canvas');canvas.width=Math.min(2048,Math.max(256,Math.round(w/h*256)));canvas.height=256;
  const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,256);ctx.fillStyle=ink;ctx.font='500 62px sans-serif';ctx.textAlign='left';ctx.fillText(text,32,150,canvas.width-64);
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
  return mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,roughness:.8}),pos);
 }
 box([8,.12,9],[0,-.09,0],floor);box([8,3.5,.15],[0,1.7,-3.7],wall);
 box([.15,3.5,9],[-3.7,1.7,0],wall);box([.15,3.5,9],[3.7,1.7,0],wall);
 box([8,3.5,.15],[0,1.7,4.45],wall);
 box([8,.12,9],[0,3.5,0],m('#bbc5c0'));
 for(let x=-3;x<=3;x+=1.2)box([.003,.001,8],[x,-.029,0],m('#8c9994'));
 for(let z=-3;z<5;z+=1.2)box([7.3,.001,.003],[0,-.029,z],m('#8c9994'));
 box([7.25,.13,.08],[0,.1,-3.59],steel);
 for(const x of [-2,0,2]){
  box([.8,.06,1.5],[x,3.42,-.6],dark);
  box([.72,.015,1.4],[x,3.379,-.6],new T.MeshStandardMaterial({color:'#f2f1dc',emissive:'#eee9d2',emissiveIntensity:1.5}));
 }
 // Real-scale worktop, cabinet reveal lines, handles and inset sink.
 // Worktop is assembled around a real sink opening, not a dark rectangle.
 box([1.07,.055,.72],[-2.615,1.01,-3.22]);box([4.47,.055,.72],[.915,1.01,-3.22]);
 box([.76,.055,.12],[-1.7,1.01,-3.52]);box([.76,.055,.14],[-1.7,1.01,-2.93]);box([6.3,.86,.65],[0,.55,-3.24],m('#aab5b3',.48,.42));
 for(let x=-3;x<3;x+=.63){box([.008,.74,.014],[x,.56,-2.903],dark);rod([[x+.17,.79,-2.885],[x+.17,.79,-2.845],[x+.39,.79,-2.845],[x+.39,.79,-2.885]],.009);}
 // Rounded rectangular stainless basin with sloping sides and a recessed drain.
 const bowlVertices=[],bowlIndices=[],segments=96;
 const rings=[[.38,.24,1.039],[.365,.225,1.026],[.34,.20,.89],[.27,.15,.85],[.035,.035,.84]];
 for(const [rx,rz,y] of rings)for(let i=0;i<segments;i++){
  const a=i/segments*Math.PI*2,co=Math.cos(a),si=Math.sin(a);
  bowlVertices.push(-1.7+rx*Math.sign(co)*Math.pow(Math.abs(co),.45),y,-3.18+rz*Math.sign(si)*Math.pow(Math.abs(si),.45));
 }
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){
  const a=j*segments+i,b=j*segments+(i+1)%segments,c=a+segments,d=b+segments;bowlIndices.push(a,c,b,b,c,d);
 }
 const basin=new T.BufferGeometry();basin.setAttribute('position',new T.Float32BufferAttribute(bowlVertices,3));basin.setIndex(bowlIndices);basin.computeVertexNormals();
 const basinMat=steel.clone();basinMat.side=T.DoubleSide;mesh(basin,basinMat,[0,0,0]);
 cyl(.035,.006,[-1.7,.838,-3.18],dark);
 for(let i=0;i<5;i++)rod([[-1.725+i*.012,.844,-3.205],[-1.725+i*.012,.844,-3.155]],.002,steel);
 rod([[-1.99,1.05,-3.4],[-1.99,1.42,-3.4],[-1.73,1.45,-3.32],[-1.7,1.28,-3.18]],.018);
 // Frosted observation window and ventilation panel.
 box([2.7,1.2,.05],[-1.8,2.28,-3.6],steel);box([2.6,1.1,.055],[-1.8,2.28,-3.56],m('#8daba9',.12,.22));
 for(let x=-3;x<-.5;x+=.66)box([.016,1.08,.035],[x,2.28,-3.51],steel);
 box([1.2,.5,.03],[2.55,2.75,-3.59],white);
 for(let y=2.57;y<2.95;y+=.04)box([1.08,.012,.025],[2.55,y,-3.56],m('#6d7e7b'));
 plate('FORENSIC MEDICINE',[.7,2.38,-3.6],1.7,.28,'#d8e1dc','#3a5555');
 plate('01  /  검체 관찰실',[.7,2.08,-3.6],1.7,.20,'#466560','#f0f4ed');
 // Storage, specimen jars and folded supplies.
 for(let i=0;i<6;i++){
  const x=.4+i*.24;cyl(.055,.16,[x,1.12,-3.15],m('#c3cbc4',.05,.3));cyl(.057,.025,[x,1.21,-3.15],m('#53645c'));
  const tag=plate(String(i+1).padStart(2,'0'),[x,1.12,-3.093],.07,.04);
 }
 box([.42,.19,.24],[2.6,1.14,-3.14],m('#d9ded6'));
 // Stainless autopsy table: raised rim, channel, sloped tray and pedestal.
 const tx=-.55;
 box([.86,.09,2.32],[tx,.96,0]);box([.79,.028,2.22],[tx,1.025,0],m('#aeb8b4',.78,.3));
 for(const x of [tx-.42,tx+.42])box([.026,.07,2.27],[x,1.05,0]);
 for(const z of [-1.13,1.13])box([.85,.07,.026],[tx,1.05,z]);
 box([.4,.72,.7],[tx,.53,0],steel);box([.76,.075,1.12],[tx,.13,0],steel);
 for(const x of [tx-.3,tx+.3])for(const z of [-.46,.46]){const wheel=cyl(.06,.04,[x,.075,z],rubber);wheel.rotation.z=Math.PI/2;}
 cyl(.025,.012,[tx,1.043,1.03],dark);
 // Entire body remains draped; the silhouette replaces the visible capsule mannequin.
 const sheet=new T.PlaneGeometry(1.12,2.08,70,130),p=sheet.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),head=.17*Math.exp(-Math.pow((y-.8)/.2,2))*Math.exp(-Math.pow(x/.17,2));
  const torso=.24*Math.exp(-Math.pow((y-.24)/.54,2))*Math.exp(-Math.pow(x/.29,4));
  const legs=.13*Math.exp(-Math.pow((y+.56)/.49,4))*Math.exp(-Math.pow(x/.23,4));
  const edge=Math.max(0,(Math.abs(x)-.26)/.30);
  const fold=.003*Math.sin(x*33+y*8)+edge*.012*Math.sin(y*29+x*7)+.002*Math.sin(y*43-x*12);
  const drape=-.28*Math.pow(Math.max(0,(Math.abs(x)-.37)/.19),1.2);
  p.setZ(i,Math.pow(Math.pow(head,6)+Math.pow(torso,6)+Math.pow(legs,6),1/6)+fold+drape);
 }
 sheet.computeVertexNormals();const cover=mesh(sheet,cloth,[tx,1.08,0]);cover.rotation.x=-Math.PI/2;
 // Mobile inspection table and inset tray; origin shared with the interactive specimen.
 box([.93,.052,.73],[1.28,1.035,.1],steel);
 box([.82,.018,.63],[1.28,1.072,.1],m('#87938e',.8,.32));
 for(const x of [.84,1.72])box([.024,.055,.69],[x,1.09,.1],steel);
 for(const z of [-.24,.44])box([.9,.055,.024],[1.28,1.09,z],steel);
 for(const x of [.89,1.67])for(const z of [-.2,.4]){rod([[x,.15,z],[x,1.03,z]],.017);const wheel=cyl(.048,.035,[x,.12,z],rubber);wheel.rotation.z=Math.PI/2;}
 box([.78,.022,.57],[1.28,.39,.1],steel);
 const pad=mesh(new T.PlaneGeometry(.46,.4,25,25),cloth,[1.28,1.095,.1]);pad.rotation.x=-Math.PI/2;
 const evidence=plate('FM–01  /  H',[1.62,1.105,.33],.2,.065);evidence.rotation.x=-Math.PI/2;
 // Focus lamp, magnifier arm, instrument rest.
 rod([[2.08,.05,-.4],[2.08,2.15,-.4],[1.6,2.48,-.4],[1.26,2.14,-.18]],.025);
 const lamp=cyl(.2,.075,[1.26,2.11,-.18],white);const glow=cyl(.16,.01,[1.26,2.066,-.18],new T.MeshStandardMaterial({color:'#fff6dd',emissive:'#fff6dd',emissiveIntensity:1}));
 box([.28,.024,.08],[1.92,1.06,.32],steel);
 for(const z of [.29,.34])rod([[1.8,1.087,z],[2.03,1.087,z+.01]],.005,steel);
 // Door, threshold and handle provide spatial scale.
 box([.06,2.34,1.05],[3.57,1.17,-2],dark);
 box([.065,2.22,.91],[3.52,1.15,-2],m('#a3b3ae',.2,.44));
 for(const z of [-2.51,-1.49])box([.10,2.36,.055],[3.51,1.18,z]);
 box([.1,.055,1.07],[3.51,2.35,-2]);
 box([.012,.34,.81],[3.478,.28,-2]);
 box([.018,.58,.31],[3.475,1.76,-2],steel);
 box([.02,.51,.245],[3.462,1.76,-2],m('#6b8991',.28,.22));
 for(const y of [.35,1.12,1.98])box([.095,.09,.026],[3.48,y,-2.43],steel);
 box([.14,.045,.19],[3.47,2.22,-1.68],steel);
 const doorLabel=plate('01',[3.455,1.34,-2],.16,.09,'#d9e1dc','#304847');doorLabel.rotation.y=-Math.PI/2;
 rod([[3.55,1.12,-1.7],[3.51,1.12,-1.7],[3.51,.93,-1.7]],.015);
 // Wall protection panels, corner trims and suspended ceiling seams.
 const trim=m('#829994',.35,.52),panel=m('#b3bcb8',.08,.72);
 for(const x of [-3.59,3.59]){
  box([.035,.82,7.6],[x,.51,.32],panel);
  box([.055,.055,7.6],[x,.96,.32],trim);
  box([.055,.12,7.6],[x,.075,.32],steel);
 }
 for(let x=-3.6;x<=3.6;x+=.9)box([.016,.025,8],[x,3.424,.3],m('#8d9e99'));
 for(let z=-3.3;z<=4.2;z+=.9)box([7.3,.025,.016],[0,3.424,z],m('#8d9e99'));
 // Rear cabinets stay within the existing blocked worktop footprint.
 for(const x of [-2.75,-2.0,-1.25]){
  box([.69,.75,.26],[x,1.77,4.21],white);
  box([.64,.68,.015],[x,1.77,4.065],m('#c7d4d0',.15,.54));
  rod([[x+.22,1.65,4.04],[x+.22,1.85,4.04]],.009);
 }
 // Countertop workstation: display, compact analyzer, supplies and task paperwork.
 box([.49,.32,.045],[2.05,1.40,-3.15],dark);
 box([.04,.18,.04],[2.05,1.17,-3.15]);box([.24,.018,.17],[2.05,1.053,-3.15]);
 plate('FM-01   |   READY',[2.05,1.42,-3.121],.43,.23,'#182e35','#99c6b6');
 box([.32,.025,.12],[2.05,1.059,-2.99],m('#465957'));
 box([.46,.30,.38],[-.72,1.19,-3.2],white);
 box([.22,.08,.015],[-.72,1.26,-2.999],dark);
 plate('STANDBY',[-.72,1.26,-2.988],.19,.055,'#263d41','#b9dace');
 for(let i=0;i<4;i++)box([.30,.018,.22],[2.83,1.06+i*.022,-3.14],m(i%2?'#c8d6d0':'#eff0e4'));
 const clipboard=box([.2,.008,.27],[.97,1.108,.27],m('#516963'));clipboard.rotation.y=-.12;
 const paper=box([.176,.001,.235],[.97,1.113,.27],m('#eeeede'));paper.rotation.y=-.12;
 // Rack and distinct caps for sample tubes; cylinders are small, opaque scene props.
 box([.36,.035,.12],[.02,1.065,-3.05],m('#c6d1c7'));
 for(let i=0;i<6;i++){cyl(.016,.12,[-.13+i*.053,1.14,-3.05],m('#b9c9c3',.08,.24));cyl(.018,.025,[-.13+i*.053,1.21,-3.05],m(i<3?'#7d929c':'#978876'));}
 // Wall clock and dispensers are architectural details, not new interactable tasks.
 const clock=cyl(.18,.035,[2.55,2.13,-3.54],dark);clock.rotation.x=Math.PI/2;
 const face=mesh(new T.CircleGeometry(.164,48),m('#e2e6db'),[2.55,2.13,-3.517]);
 rod([[2.55,2.13,-3.51],[2.55,2.24,-3.51]],.006,dark);
 rod([[2.55,2.13,-3.51],[2.63,2.08,-3.51]],.007,dark);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;box([.012,.012,.005],[2.55+Math.sin(a)*.145,2.13+Math.cos(a)*.145,-3.509],dark);}
 box([.20,.30,.11],[-3.36,1.50,-3.51],white);box([.09,.08,.12],[-3.36,1.35,-3.48],dark);
 // Low-cost soft contact shading anchors furniture without black hard-edged blobs.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
 const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(64,64,8,64,64,64);
 gradient.addColorStop(0,'rgba(8,24,24,.28)');gradient.addColorStop(1,'rgba(8,24,24,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
 const shadowMap=new T.CanvasTexture(shadowCanvas);
 for(const [x,z,w,h] of [[-.55,0,1.65,2.9],[1.28,.1,1.7,1.45]]){
  const shadow=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false}),[x,-.026,z]);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
 }
 // Practical ceiling light pools. Only one shadow map keeps movement responsive.
 for(const [x,z,power] of [[-.7,0,52],[1.35,.1,42],[0,-2.4,30]]){
  const light=new T.SpotLight('#eef3e8',power,7,1.05,.8,2);light.position.set(x,3.32,z);light.target.position.set(x,.2,z);
  if(x===-.7){light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.bias=-.0003;light.shadow.normalBias=.015;light.shadow.radius=3;}
  root.add(light,light.target);
 }
 // Assembly details: caster forks, hubs, tray fasteners and rear service plumbing.
 for(const x of [.89,1.67])for(const z of [-.2,.4]){
  box([.065,.075,.016],[x,.17,z-.028],steel);
  box([.065,.075,.016],[x,.17,z+.028],steel);
  const hub=cyl(.017,.047,[x,.12,z],steel);hub.rotation.x=Math.PI/2;
 }
 for(const x of [.86,1.70])for(const z of [-.21,.41]){
  cyl(.009,.003,[x,1.12,z],steel);box([.009,.001,.0015],[x,1.122,z],dark);
 }
 rod([[-1.7,.84,-3.18],[-1.7,.60,-3.18],[-1.7,.54,-3.36],[-1.7,.72,-3.48]],.024,steel);
 // Water mixer levers and nozzle collar.
 cyl(.027,.024,[-1.99,1.058,-3.4]);rod([[-1.99,1.08,-3.4],[-2.12,1.12,-3.4]],.009);
 cyl(.025,.036,[-1.7,1.27,-3.18]);
 // Backsplash sockets and cable routed behind the workstation.
 for(const x of [-.6,1.9,2.8]){
  box([.13,.10,.026],[x,1.20,-3.57],white);
  for(const dx of [-.025,.025])box([.009,.022,.004],[x+dx,1.2,-3.551],dark);
 }
 rod([[2.05,1.17,-3.17],[2.25,1.07,-3.32],[2.22,1.06,-3.5],[1.9,1.2,-3.54]],.004,rubber);
 // Instrument tray has a rolled rim and individually modeled blunt tools.
 box([.27,.012,.16],[1.57,1.115,-.09],steel);
 rod([[1.44,1.127,-.16],[1.70,1.127,-.16],[1.70,1.127,-.02],[1.44,1.127,-.02],[1.44,1.127,-.16]],.004);
 for(const z of [-.12,-.065]){
  rod([[1.48,1.133,z],[1.55,1.135,z],[1.64,1.133,z+.009]],.003);
  rod([[1.48,1.133,z],[1.55,1.135,z+.016],[1.64,1.133,z+.009]],.003);
 }
 // A fine grid on the floor drain, outside the central walking line.
 box([.18,.002,.18],[2.55,-.027,-2.15],steel);
 for(let i=0;i<7;i++)box([.14,.001,.006],[2.55,-.025,-2.21+i*.02],dark);
 // Suspended lamp's concentric lens, swivel and grip give the fixture depth.
 cyl(.205,.014,[1.26,2.072,-.18],steel);
 cyl(.159,.016,[1.26,2.057,-.18],new T.MeshStandardMaterial({color:'#eff4e7',emissive:'#d9e4d3',emissiveIntensity:.35,roughness:.25}));
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;cyl(.025,.006,[1.26+Math.sin(a)*.112,2.046,-.18+Math.cos(a)*.112],white);
 }
 cyl(.022,.09,[1.26,2.015,-.18],white);
 const joint=cyl(.055,.07,[1.26,2.18,-.18],dark);joint.rotation.z=Math.PI/2;
 // Flat storage labels and glove-box opening improve scale at close range.
 plate('SPECIMEN  /  01',[.99,1.15,-3.09],.22,.065,'#e9e7d9','#354a49');
 box([.24,.014,.075],[2.6,1.242,-3.14],dark);
 const tissue=mesh(new T.PlaneGeometry(.12,.09,8,8),cloth,[2.6,1.256,-3.14]);tissue.rotation.x=-1.15;
 for(let i=0;i<3;i++){
  const x=2.8-i*.10;box([.055,.035,.035],[x,1.08,-2.98],m('#c8d0c9'));rod([[x-.018,1.103,-2.98],[x+.018,1.103,-2.98]],.002,dark);
 }
 // Physical episode stations: wall dossier, specimen and laboratory workstation.
 const folder=box([.055,.68,.51],[3.49,1.43,1.8],dark);
 const filePaper=box([.012,.59,.43],[3.451,1.43,1.8],m('#eee9d9'));
 const fileHeading=plate('FM–01  /  사건 파일',[3.438,1.61,1.8],.36,.07,'#eee9d9','#304c48');fileHeading.rotation.y=-Math.PI/2;
 for(let i=0;i<7;i++)box([.003,.003,.29-i%3*.035],[3.437,1.51-i*.043,1.8],m('#a4ada0'));
 box([.025,.04,.12],[3.431,1.74,1.8],steel);
 const stationLights={};
 function stationTag(id,text,position,rotation=0){
  const tag=plate(text,position,.38,.085,'#294844','#d1dfcc');tag.rotation.y=rotation;
  const material=new T.MeshStandardMaterial({color:'#88ae9b',emissive:'#88ae9b',emissiveIntensity:.25});
  const beacon=mesh(new T.SphereGeometry(.016,12,8),material,[position[0],position[1]+.07,position[2]]);stationLights[id]=material;
 }
 stationTag('briefing','01  사건 브리핑',[3.43,1.88,1.8],-Math.PI/2);
 stationTag('heart','02  심장 관찰대',[1.28,1.0,.48]);
 stationTag('terminal','03  감정 단말기',[2.05,1.66,-3.11]);
 root.userData.setObjective=id=>{for(const [key,mat] of Object.entries(stationLights)){mat.color.set(key===id?'#e2bf7b':'#608579');mat.emissive.copy(mat.color);mat.emissiveIntensity=key===id?1.2:.15;}};
 return root;
}

