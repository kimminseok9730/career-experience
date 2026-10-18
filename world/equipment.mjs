import * as T from '../vendor/three.module.js';

// This training case trips the overload relay, not the branch breaker.
export function starterStatus(plant,index){
 const pump=plant.pumps['PM-103-'+String.fromCharCode(65+index)];
 return {breaker:'ON',contactor:pump==='running'?'CLOSED':'OPEN',overload:pump==='faulted'?'TRIP':'READY'};
}

// Detailed assemblies in metres. Representative construction, not an as-built survey.
export function createEquipment({scene, box, cylinder, rod, plaque, material, target}) {
 const paint=material('#cbd4ce',.3,.43), edge=material('#738581',.65,.32), dark=material('#202e31',.18,.54);
 const copper=material('#ae7246',.72,.32), insulation=material('#273c4b',.05,.7);
 const doors=[], displays=[],terminals=[];
 function label(text,w,h,p,parent,bg='#e0e6dd',fg='#21312f'){return plaque(text,w,h,p,{parent,bg,fg,size:95});}
 function hinge(parent,x,y,z){cylinder(.015,.095,[x,y,z],edge,parent);box([.043,.085,.006],[x+.019,y,z-.008],edge,parent);}
 function door(parent,{x=0,y=0,z=0,w,h,id,station,angle=-1.65}){
  const pivot=new T.Group();pivot.name=id+'.hinge';pivot.position.set(x,y,z);parent.add(pivot);
  const leaf=new T.Group();leaf.name=id+'.leaf';pivot.add(leaf);
  const skin=box([w,h,.025],[w/2,h/2,0],paint,leaf);skin.name=id+'.outer-skin';
  for(const xx of [.014,w-.014])box([.024,h,.045],[xx,h/2,-.025],edge,leaf);
  for(const yy of [.025,h-.025])box([w-.025,.04,.045],[w/2,yy,-.025],edge,leaf);
  for(const yy of [h*.2,h*.8])box([w-.05,.03,.026],[w/2,yy,-.047],paint,leaf);
  for(const yy of [.17,h/2,h-.17])hinge(parent,x,y+yy,z);
  const handle=new T.Group();handle.name=id+'.handle';handle.position.set(w-.055,h*.49,.037);leaf.add(handle);
  cylinder(.024,.012,[0,0,0],edge,handle).rotation.x=Math.PI/2;
  box([.018,.14,.025],[0,-.04,.025],dark,handle);
  const d={id,station,pivot,leaf,handle,width:w,height:h,angle,current:0,wanted:0,open:false,latch:0,stuck:false};
  skin.userData.door=d;
  target(skin,station==='mcc'?'MCC-P':station==='ups'?'UPS':'전기실 출입문','');
  skin.userData.inspect={station,door:d};
  const jamb=box([.027,h,.038],[x-.024,y+h/2,z],edge,parent);
  target(jamb,station==='mcc'?'MCC-P':station==='ups'?'UPS':'전기실 출입문','');jamb.userData.inspect={station,door:d};
  doors.push(d);return d;
 }
 function readout(text,w,h,p,parent,station){
  box([w+.035,h+.03,.033],[p[0],p[1],p[2]-.025],dark,parent);
  const lcd=label(text,w,h,p,parent,'#12262c','#a8e5c8');
  target(lcd,station==='mcc'?'MCC-P':station==='ups'?'UPS':'운전감시 HMI','');
  lcd.userData.inspect={station,detail:true};return lcd;
 }
 function cabinet(name,x,width,depth,station){
  const g=new T.Group();g.name=name;g.position.set(x,0,-4.26);scene.add(g);
  // Hollow enclosure: no solid cuboid behind the door concealing the equipment.
  box([width,.085,depth],[0,.045,0],dark,g);
  box([width,2.28,.025],[0,1.21,-depth/2],paint,g);
  for(const xx of [-width/2,width/2])box([.024,2.26,depth],[xx,1.2,0],paint,g);
  for(const yy of [.1,2.34])box([width,.026,depth],[0,yy,0],paint,g);
  const cols=name==='MCC-P'?3:1,cw=width/cols;
  for(let i=0;i<cols;i++){
   const cx=-width/2+cw*(i+.5),back=-depth/2+.09;
   const backplate=box([cw-.035,2.12,.02],[cx,1.2,back],edge,g);
   if(i)box([.015,2.22,depth-.02],[-width/2+cw*i,1.2,0],edge,g);
   const d=door(g,{x:cx-cw/2+.012,y:.12,z:depth/2+.022,w:cw-.024,h:2.19,id:name+'-'+i,station});
   target(backplate,name,'');backplate.userData.inspect={station,door:d,internal:true,cabinet:i};
   label(name==='MCC-P'?'PM-103 '+String.fromCharCode(65+i):name,cw-.09,.075,[d.width/2,2.065,.022],d.leaf);
   const display=readout('—',Math.min(.38,cw-.09),.20,[d.width/2,1.79,.04],d.leaf,station);
   const lamps=[];
   for(let k=0;k<3;k++){
    const mat=new T.MeshStandardMaterial({color:'#172c22',emissive:'#000',roughness:.25});
    const lamp=cylinder(.021,.018,[d.width/2+(k-1)*.095,1.44,.044],mat,d.leaf);lamp.rotation.x=Math.PI/2;lamps.push(mat);
   }
   label(station==='ups'?'NORMAL   FAULT   OUTPUT':'RUN    TRIP    POWER',cw-.08,.044,[d.width/2,1.36,.03],d.leaf);
   for(let k=0;k<7;k++)box([cw-.15,.009,.012],[d.width/2,.18+k*.029,.024],dark,d.leaf);
   display.userData.inspect={station,door:d};
   if(station==='ups'){
    box([cw-.11,.4,.28],[cx,1.81,back+.18],dark,g);label('UPS · INVERTER',cw-.13,.07,[cx,1.86,back+.326],g);
    for(const yy of [.48,.95,1.42]){
     box([cw-.055,.025,depth-.12],[cx,yy-.15,0],edge,g);
     for(const xx of [cx-.14,cx+.14]){
      box([.23,.27,.22],[xx,yy,back+.17],dark,g);label('BATTERY',.19,.045,[xx,yy,back+.283],g);
      for(const dx of [-.065,.065]){const color=material(dx<0?'#b94d3d':'#202a30');box([.028,.018,.025],[xx+dx,yy+.145,back+.17],color,g);}
     }
     rod([cx-.075,yy+.15,back+.17],[cx+.075,yy+.15,back+.17],.009,insulation,g);
    }
    displays.push({station,index:i,display,lamps,door:d});continue;
   }
   // DIN rails, breaker, contactor, overload relay, slotted duct and terminal strip.
   for(const yy of [.48,1.1,1.72])box([cw-.09,.037,.02],[cx,yy,back+.027],edge,g);
   for(const xx of [cx-cw/2+.045,cx+cw/2-.045]){
    box([.055,1.8,.06],[xx,1.2,back+.044],paint,g);
    for(let yy=.36;yy<2.08;yy+=.05)box([.032,.013,.009],[xx,yy,back+.079],dark,g);
   }
   const breaker=box([.23,.24,.10],[cx,1.72,back+.08],dark,g);
   const lever=box([.045,.065,.025],[cx,1.74,back+.15],edge,g);
   label('QF · ON',.21,.038,[cx,1.805,back+.137],g);
   label('L1       L2       L3',.27,.04,[cx,2.16,back+.15],g);
   for(let k=0;k<3;k++){
    const xx=cx+(k-1)*.092,terminal=new T.Group();terminal.name=name+'-'+i+'-L'+(k+1);terminal.userData.visualTerminal=true;g.add(terminal);
    const shell=box([.072,.10,.065],[xx,1.94,back+.095],paint.clone(),terminal);
    const jacket=cylinder(.014,.15,[xx,2.06,back+.11],insulation.clone(),terminal);
    const screw=cylinder(.014,.012,[xx,1.945,back+.133],copper.clone(),terminal);screw.rotation.x=Math.PI/2;
    box([.018,.003,.001],[xx,1.945,back+.140],dark,terminal);
    const scar=new T.Group();terminal.add(scar);
    const scorch=new T.MeshStandardMaterial({color:'#432619',roughness:1});
    for(let n=0;n<5;n++){
     const patch=box([.007+n*.001,.002,.0008],[xx+(n%2?-.004:.003),1.987+n*.013,back+.125],scorch,scar);patch.rotation.z=(n%2?1:-1)*.4;
    }
    scar.visible=false;
    for(const part of [shell,jacket,screw]){target(part,name,'');part.userData.inspect={station,door:d,internal:true,cabinet:i};}
    terminals.push({terminal,shell,jacket,screw,scar,index:i,phase:k});
    rod([xx,1.89,back+.11],[cx+(k-1)*.065,1.84,back+.11],.01,insulation,g);
   }
   box([.23,.23,.12],[cx,1.17,back+.10],dark,g);
   const contactFlag=label('KM · OPEN',.21,.045,[cx,1.20,back+.168],g);
   const armature=box([.07,.035,.018],[cx,1.12,back+.172],edge,g);
   box([.23,.11,.1],[cx,.965,back+.085],paint,g);
   const flag=label('FR · READY',.21,.04,[cx,.965,back+.14],g);
   for(let k=0;k<3;k++){
    const xx=cx+(k-1)*.065;
    const path=[new T.Vector3(xx,1.59,back+.10),new T.Vector3(xx,1.48,back+.16),new T.Vector3(xx,1.34,back+.16),new T.Vector3(xx,1.29,back+.1)];
    const wire=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(path),14,.009,8,false),insulation);g.add(wire);
    rod([xx,1.055,back+.10],[xx,1.02,back+.10],.009,insulation,g);
    rod([xx,.49,back+.09],[xx,.90,back+.09],.009,insulation,g);
    box([.044,.1,.06],[xx,.47,back+.065],paint,g);
    cylinder(.009,.015,[xx,.47,back+.10],copper,g).rotation.x=Math.PI/2;
    rod([xx,.42,back+.09],[xx,.24,back+.09],.009,insulation,g);
   }
   label('T1      T2      T3',.25,.035,[cx,.36,back+.12],g);
   label('DOL · REPRESENTATIVE',cw-.09,.029,[cx,.19,back+.10],g);
   // Flexible protective bonding conductor follows the opening door.
   const bondMat=material('#c8b938',.1,.65);
   const bond=new T.Mesh(new T.TubeGeometry(new T.LineCurve3(new T.Vector3(),new T.Vector3(.1,0,0)),12,.006,6,false),bondMat);g.add(bond);
   d.bond=bond;d.bondRoot=g;d.bondAnchor=new T.Vector3(cx-cw/2+.055,.38,back+.05);
   displays.push({station,index:i,display,lamps,flag,lever,contactFlag,armature,door:d});
   display.userData.inspect={station,door:d};
   breaker.userData.inspect={station,detail:true,internal:true,door:d};target(breaker,name,'');breaker.userData.inspect={station,detail:true,internal:true,door:d,cabinet:i};
  }
  rod([0,2.35,0],[0,3.7,0],.035,dark,g);return g;
 }
 function update(p){
  function text(mesh,value,bg='#12262c',fg='#ace9c9'){
   const tex=mesh.material.map,c=tex.image.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,tex.image.width,tex.image.height);c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';
   const lines=value.split('\n');c.font='bold '+Math.floor(tex.image.height/(lines.length*1.5))+'px Malgun Gothic';lines.forEach((s,i)=>c.fillText(s,tex.image.width/2,(i+.5)*tex.image.height/lines.length,tex.image.width-25));tex.needsUpdate=true;
  }
  for(const item of displays){
   const status=p.pumps['PM-103-'+String.fromCharCode(65+item.index)],fault=status==='faulted',run=status==='running';
   text(item.display,item.station==='ups'?(p.upsHealthy?'UPS\nNORMAL':'UPS\nFAULT'):((run?'RUN':fault?'TRIP':'STOP')+'\n'+(p.mccEnergized?'POWER ON':'POWER OFF')));
   (item.station==='ups'?[p.upsHealthy,!p.upsHealthy,p.upsHealthy]:[run,fault,p.mccEnergized]).forEach((on,k)=>{const color=on?['#40db85','#ef714d','#e5c779'][k]:'#18221e';item.lamps[k].color.set(color);item.lamps[k].emissive.set(on?color:'#000');item.lamps[k].emissiveIntensity=.65;});
   if(item.station==='mcc'){
    const state=starterStatus(p,item.index);
    text(item.flag,'FR · '+state.overload,fault?'#8b3d21':'#283934');
    text(item.contactFlag,'KM · '+state.contactor);item.armature.position.y=run?1.105:1.125;
    item.lever.rotation.z=0;
   }
  }
 }
 function intersects(d,p,angle=d.current){
  d.pivot.parent.updateMatrixWorld(true);
  const a=d.pivot.parent.localToWorld(d.pivot.position.clone());
  const b=d.pivot.parent.localToWorld(d.pivot.position.clone().add(new T.Vector3(Math.cos(angle)*d.width,0,-Math.sin(angle)*d.width)));
  const dx=b.x-a.x,dz=b.z-a.z,t=T.MathUtils.clamp(((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz),0,1);
  return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz)<.24;
 }
 function tick(dt,player){
  for(const d of doors){
   d.latch=T.MathUtils.damp(d.latch,d.open?1:0,14,dt);d.handle.rotation.z=-d.latch*.35;
   let held=false;
   if(!d.open||d.latch>.85){const next=T.MathUtils.damp(d.current,d.open?d.angle:0,5,dt);held=!!player&&intersects(d,player,next);if(!held)d.current=next;}
   d.stuck=held&&(d.open||Math.abs(d.current)>=.03);
   d.pivot.rotation.y=d.current;
   if(d.bond&&d.lastBondAngle!==d.current){d.lastBondAngle=d.current;d.pivot.updateMatrixWorld(true);const end=d.bondRoot.worldToLocal(d.leaf.localToWorld(new T.Vector3(.09,.23,-.06)));const a=d.bondAnchor;const middle=a.clone().lerp(end,.5);middle.y-=.10;const geometry=new T.TubeGeometry(new T.CatmullRomCurve3([a,middle,end]),12,.006,6,false);d.bond.geometry.dispose();d.bond.geometry=geometry;}
  }
 }
 function setVariant(variant){
  for(const t of terminals){const damaged=variant==='supply'&&t.index===1&&t.phase===1;t.terminal.userData.damaged=damaged;t.scar.visible=damaged;
   t.shell.material.color.set(damaged?'#936440':'#cbd4ce');t.jacket.material.color.set(damaged?'#6c4229':'#273c4b');t.screw.material.color.set(damaged?'#493328':'#ae7246');
   t.jacket.scale.x=damaged?1.35:1;t.jacket.rotation.z=damaged?.07:0;
  }
 }
 return {cabinet,door,doors,update,tick,setVariant,blocked(p){return doors.some(d=>intersects(d,p));},reset(){for(const d of doors){d.open=false;d.current=0;d.latch=0;d.stuck=false;d.pivot.rotation.y=0;}}};
}
