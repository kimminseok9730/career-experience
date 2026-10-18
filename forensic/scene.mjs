import * as T from 'three';
import {createSpecimen} from './models.mjs';
import {createRoom,SPECIMEN_ORIGIN} from './room.mjs';
import {loadCase01} from './anatomy.mjs';
import {EffectComposer} from '../vendor/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from '../vendor/jsm/postprocessing/RenderPass.js';
import {SSAOPass} from '../vendor/jsm/postprocessing/SSAOPass.js';
import {OutputPass} from '../vendor/jsm/postprocessing/OutputPass.js';
import {stationInReach} from '../core/forensic-episode.mjs';
import {spawnPlayer,movePlayer} from '../core/room-navigation.mjs';
import {pickTissue,normalizeYaw} from './interaction.mjs';

export async function createScene(host,{onMark,onReady,onError,onInteract,onProximity,onNavigation,onHint}){
 const parts=await loadCase01();
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
 const canvas=renderer.domElement;host.append(canvas);canvas.tabIndex=0;
 canvas.setAttribute('aria-label','3D 관찰 화면. 방향키로 회전, 더하기와 빼기로 확대, M으로 중앙 위치 표시');
 const scene=new T.Scene();scene.background=new T.Color('#adb9b6');scene.fog=new T.Fog('#adb9b6',12,24);
 const camera=new T.PerspectiveCamera(65,1,.012,40);
 const composer=new EffectComposer(renderer);composer.setPixelRatio(Math.min(devicePixelRatio,1.5));composer.renderTarget1.samples=4;composer.renderTarget2.samples=4;
 composer.addPass(new RenderPass(scene,camera));
 const ambientOcclusion=new SSAOPass(scene,camera,1,1,16);
 ambientOcclusion.kernelRadius=.12;ambientOcclusion.minDistance=.001;ambientOcclusion.maxDistance=.08;
 composer.addPass(ambientOcclusion);composer.addPass(new OutputPass());
 const ambient=new T.HemisphereLight('#eef0e9','#4d575b',1.15);scene.add(ambient);
 const key=new T.DirectionalLight('#fff0dc',2.5);key.position.set(-2,6,3);key.castShadow=true;
 key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:16});key.shadow.normalBias=.0015;scene.add(key);
 const fill=new T.DirectionalLight('#d5e5ed',1.1);fill.position.set(4,2,-2);scene.add(fill);
 const envScene=new T.Scene();envScene.background=new T.Color('#8c9999');
 const shell=new T.Mesh(new T.BoxGeometry(8,6,8),new T.MeshBasicMaterial({color:'#a4aeac',side:T.BackSide}));envScene.add(shell);
 for(const pos of [[-2,2,1],[2,2,-1],[0,2.95,0]]){const panel=new T.Mesh(new T.BoxGeometry(1.5,.04,2),new T.MeshBasicMaterial({color:new T.Color(3,3,2.8)}));panel.position.set(...pos);envScene.add(panel);}
 const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromScene(envScene,.04);scene.environment=environment.texture;scene.environmentIntensity=.55;pmrem.dispose();
 const room=createRoom();scene.add(room);
 const stage=new T.Group();scene.add(stage);stage.position.copy(SPECIMEN_ORIGIN);stage.scale.setScalar(.1);
 const main=new T.Group(),ref=new T.Group();stage.add(main,ref);
 const ringMaterial=new T.MeshBasicMaterial({color:'#eccc8d',depthTest:false});
 const pin=new T.Group();
 const ring=new T.Mesh(new T.TorusGeometry(.075,.011,8,40),ringMaterial);pin.add(ring);
 const dot=new T.Mesh(new T.SphereGeometry(.018,12,8),ringMaterial);pin.add(dot);pin.renderOrder=20;pin.visible=false;main.add(pin);
 const ray=new T.Raycaster(),pointer=new T.Vector2();
 let roomMode=true,source='surface',compare=false,markMode=false,model=null,reference=null;
 let view={yaw:0,pitch:0,zoom:1},roomView=spawnPlayer(),drag=null,dead=false;
 const cameraGoal=new T.Vector3(),targetGoal=new T.Vector3(),cameraTarget=new T.Vector3();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let w=1,h=1,frame=0,lastTime=performance.now(),near=null,paused=false,navTime=0;
 const held=new Set();
 const nudge=code=>{if(!roomMode||paused)return;roomView=movePlayer(roomView,{forward:['KeyW','ArrowUp'].includes(code)?1:['KeyS','ArrowDown'].includes(code)?-1:0,right:['KeyD','ArrowRight'].includes(code)?1:['KeyA','ArrowLeft'].includes(code)?-1:0},.05);updateCamera();};
 const clearKeys=()=>held.clear();
 canvas.addEventListener('blur',clearKeys);window.addEventListener('blur',clearKeys);document.addEventListener('visibilitychange',clearKeys);document.addEventListener('pointerlockchange',clearKeys);
 function disposeGroup(group){group.traverse(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.map?.dispose();m.dispose();}}});}
 function resize(){
  w=Math.max(host.clientWidth,1);h=Math.max(host.clientHeight,1);
  renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();updateCamera();
 }
 function updateCamera(){
  const v=roomMode?roomView:view;
  if(roomMode){
   cameraGoal.set(v.x,1.62,v.z);
   targetGoal.copy(cameraGoal).add(new T.Vector3(Math.sin(v.yaw)*Math.cos(v.pitch),Math.sin(v.pitch),-Math.cos(v.yaw)*Math.cos(v.pitch)));
   main.rotation.set(-Math.PI/2,0,-.25);main.position.set(0,-.65,0);ref.visible=false;

  }else{
   const aspectFactor=Math.max(1,1.15/camera.aspect);
   const dist=(compare?7.6:6.0)*aspectFactor/v.zoom*.1;
   targetGoal.copy(SPECIMEN_ORIGIN);targetGoal.y-=.025;
   cameraGoal.copy(targetGoal).add(new T.Vector3(0,.04,dist));
   main.rotation.set(v.pitch,v.yaw,0);ref.rotation.copy(main.rotation);ref.visible=compare;
   const spacing=compare?1.38:0;main.position.set(-spacing,0,0);ref.position.set(spacing,0,0);
  }
 }
 function load(keyName){
  source=keyName;
  if(model){main.remove(model);disposeGroup(model);}
  if(reference){ref.remove(reference);disposeGroup(reference);}
  model=createSpecimen(source,false,parts);reference=createSpecimen(source,true,parts);
  main.add(model);ref.add(reference);pin.visible=false;
  view={yaw:0,pitch:0,zoom:1};updateCamera();
 }
 function setRoom(value){
  roomMode=value;held.clear();if(!value&&document.pointerLockElement===canvas)document.exitPointerLock();if(value)pin.visible=false;
  canvas.setAttribute('aria-label',value?'부검실 이동 화면. WASD와 방향키로 이동, 마우스 드래그로 시선, E로 심장 관찰':'심장 관찰 화면. 방향키로 회전, 더하기와 빼기로 확대, M으로 표시, Escape로 부검실 복귀');
  camera.fov=value?65:43;camera.updateProjectionMatrix();
  room.visible=value;
  ambient.intensity=value?.75:1.15;key.intensity=value?.35:2.5;fill.intensity=value?.25:1.1;key.castShadow=!value;
  scene.environmentIntensity=value?.7:.55;
  scene.background.set(value?'#adb9b6':'#243b3e');
  scene.fog=value?new T.Fog('#adb9b6',12,24):null;
  if(value&&source!=='surface')load('surface');
  markMode=false;canvas.classList.remove('marking');updateCamera();
  camera.position.copy(cameraGoal);cameraTarget.copy(targetGoal);if(value)canvas.focus({preventScroll:true});
 }
 function setCompare(value){compare=value;ref.visible=value;updateCamera();}
 function rotate(dx,dy){const v=roomMode?roomView:view;v.yaw=normalizeYaw(v.yaw+dx);v.pitch=T.MathUtils.clamp(v.pitch+dy,-.7,.7);updateCamera();}
 function zoom(delta){if(roomMode)return;const v=view;v.zoom=T.MathUtils.clamp(v.zoom+delta,.5,2);updateCamera();}
 function placeAt(x,y){
  if(roomMode)return false;
  const rect=canvas.getBoundingClientRect();pointer.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);
  scene.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);
  const hit=pickTissue(ray,model);if(!hit)return false;
  const local=main.worldToLocal(hit.point.clone());setMark(local.toArray());onMark(local.toArray());return true;
 }
 function setMark(coords){
  pin.visible=!!coords;
  if(coords){pin.position.fromArray(coords);pin.position.z+=.015;}
 }
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0||paused)return;canvas.focus();drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{
  if(paused)return;
  if(document.pointerLockElement===canvas&&roomMode){rotate(e.movementX*.0025,-e.movementY*.0025);return;}
  if(!drag)return;
  if(!markMode)rotate((e.clientX-drag.x)*.006,(e.clientY-drag.y)*(roomMode?-.004:.005));
  drag.x=e.clientX;drag.y=e.clientY;
 });
 canvas.addEventListener('pointerup',e=>{
  if(drag&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<8&&markMode){
   if(!placeAt(e.clientX,e.clientY))onMark(null,'모형 위를 선택해 주세요. 빈 공간에는 표시할 수 없습니다.');
  }drag=null;
 });
 canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('wheel',e=>{if(document.activeElement!==canvas)return;e.preventDefault();zoom(-Math.sign(e.deltaY)*.08);},{passive:false});
 canvas.addEventListener('keyup',e=>held.delete(e.code));
 canvas.addEventListener('keydown',e=>{
  if(paused)return;
  if(roomMode){
   if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();if(!held.has(e.code))nudge(e.code);held.add(e.code);}
   if(e.code==='KeyE'&&!e.repeat){e.preventDefault();const station=stationInReach(roomView);if(station)onInteract?.(station.id);}
   if(['KeyQ','KeyR'].includes(e.code)){e.preventDefault();rotate(e.code==='KeyQ'?-.12:.12,0);}
   return;
  }
  const dirs={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]};
  if(dirs[e.key]){e.preventDefault();rotate(...dirs[e.key]);}
  if(e.key==='+'||e.key==='='){e.preventDefault();zoom(.1);}
  if(e.key==='-'){e.preventDefault();zoom(-.1);}
  if(e.key.toLowerCase()==='m')markCenter();
 });
 function markCenter(){
  if(roomMode)return;
  const p=new T.Vector3(-.55,.55,.65);main.localToWorld(p);p.project(camera);
  const rect=canvas.getBoundingClientRect();
  if(!placeAt(rect.left+(p.x+1)*rect.width/2,rect.top+(1-p.y)*rect.height/2))
   onMark(null,'현재 방향에서는 표시할 면을 찾지 못했어요. 정면으로 돌아가서 다시 시도해 주세요.');
 }
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();dead=true;cancelAnimationFrame(frame);onError('3D 연결이 중단됐어요. 저장한 기록은 유지됩니다. 새로고침해 주세요.');});
 const ro=new ResizeObserver(resize);ro.observe(host);load('surface');setRoom(true);resize();camera.position.copy(cameraGoal);cameraTarget.copy(targetGoal);
 function draw(){
  if(dead)return;frame=requestAnimationFrame(draw);
  const now=performance.now(),dt=(now-lastTime)/1000;lastTime=now;
  if(document.hidden)return;
  if(roomMode&&!paused){
   roomView=movePlayer(roomView,{forward:Number(held.has('KeyW')||held.has('ArrowUp'))-Number(held.has('KeyS')||held.has('ArrowDown')),right:Number(held.has('KeyD')||held.has('ArrowRight'))-Number(held.has('KeyA')||held.has('ArrowLeft'))},dt);updateCamera();
   const next=stationInReach(roomView);if(next?.id!==near?.id){near=next;onProximity?.(near);}
   if(now-navTime>80){navTime=now;onNavigation?.({...roomView});}
  }
  camera.position.lerp(cameraGoal,roomMode||reduced?1:.14);cameraTarget.lerp(targetGoal,roomMode||reduced?1:.14);camera.lookAt(cameraTarget);
  if(pin.visible){pin.quaternion.copy(camera.quaternion);pin.quaternion.premultiply(main.quaternion.clone().invert());}
  if(roomMode)composer.render();else renderer.render(scene,camera);
 }
 draw();onReady();
 return {
  setRoom,setCompare,load,rotate,zoom,setMark,markCenter,
  nudge,
  focus:()=>canvas.focus({preventScroll:true}),
  interact:()=>{if(roomMode&&!paused){const station=stationInReach(roomView);if(station)onInteract?.(station.id);}},
  pause(value){paused=value;held.clear();drag=null;},
  setObjective(id){room.userData.setObjective?.(id);},
  mouseLook(){if(!roomMode||paused)return;try{if(!canvas.requestPointerLock){onHint?.('이 환경에서는 드래그로 둘러보세요.');return;}canvas.requestPointerLock()?.catch?.(()=>onHint?.('마우스 자유 시선이 허용되지 않았습니다. 드래그로 둘러보세요.'));}catch{onHint?.('드래그로 둘러보세요.');}},
  hold:(code,value)=>{if(value&&roomMode&&!paused)held.add(code);else held.delete(code);},
  reset(){if(roomMode)roomView=spawnPlayer();else view={yaw:0,pitch:0,zoom:1};updateCamera();},
  setMarkMode(value){markMode=value&&!roomMode;canvas.classList.toggle('marking',markMode);},
  getView:()=>({...view}),
  setView(v){view={...v};updateCamera();},
  dispose(){dead=true;clearKeys();window.removeEventListener('blur',clearKeys);document.removeEventListener('visibilitychange',clearKeys);document.removeEventListener('pointerlockchange',clearKeys);cancelAnimationFrame(frame);ro.disconnect();for(const pass of composer.passes)pass.dispose?.();composer.dispose();disposeGroup(scene);for(const p of Object.values(parts))disposeGroup(p);disposeGroup(envScene);environment.dispose();renderer.dispose();}
 };
}
