import * as T from '../vendor/three.module.js';

// Reconstructed scene prop, not a certified emergency-light product.
export function createExitSign(){
 const group=new T.Group();group.name='exit-light';
 group.position.set(2.75,3.10,4.59);group.rotation.y=Math.PI;
 const housing=new T.MeshStandardMaterial({color:'#e4e7df',roughness:.48,metalness:.15});
 const green=new T.MeshBasicMaterial({color:'#087c49',toneMapped:false});
 const white=new T.MeshBasicMaterial({color:'#efffe8',toneMapped:false});
 const add=(geometry,material,x,y,z,name,parent=group)=>{
  const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.name=name;parent.add(o);return o;
 };
 add(new T.BoxGeometry(.68,.40,.07),housing,0,0,0,'exit-housing');
 add(new T.PlaneGeometry(.62,.34),green,0,0,.036,'exit-face');
 // Door opening, lintel and threshold, with a running figure approaching it.
 add(new T.PlaneGeometry(.105,.205),white,.12,0,.038,'exit-doorway');
 add(new T.PlaneGeometry(.078,.176),green,.106,-.002,.039,'exit-door-opening');
 add(new T.PlaneGeometry(.24,.013),white,.065,-.106,.040,'exit-threshold');
 const person=new T.Group();person.name='exit-person';group.add(person);
 add(new T.CircleGeometry(.021,24),white,-.044,.082,.042,'head',person);
 function stroke(points,width,name){
  for(let i=1;i<points.length;i++){
   const [ax,ay]=points[i-1],[bx,by]=points[i];
   const bar=add(new T.PlaneGeometry(width,Math.hypot(bx-ax,by-ay)+width*.25),white,(ax+bx)/2,(ay+by)/2,.042,name,person);
   bar.rotation.z=-Math.atan2(bx-ax,by-ay);
  }
 }
 stroke([[-.049,.048],[-.080,-.007]],.032,'torso');
 stroke([[-.051,.042],[-.005,.014],[.038,.020]],.017,'forward-arm');
 stroke([[-.057,.043],[-.108,.054],[-.141,.024]],.017,'back-arm');
 stroke([[-.078,-.006],[-.036,-.043],[-.023,-.093]],.022,'forward-leg');
 stroke([[-.079,-.006],[-.111,-.052],[-.163,-.073]],.022,'back-leg');
 for(const x of [-.318,.318])add(new T.CircleGeometry(.004,12),new T.MeshBasicMaterial({color:'#64716b'}),x,0,.036,'housing-fastener');
 return group;
}
