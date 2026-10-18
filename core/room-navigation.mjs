export const spawnPlayer=()=>({x:1.28,z:2.65,yaw:0,pitch:-.18});
// Furniture footprints, including a 24 cm walking clearance.
const obstacles=[[-1.28,.18,-1.42,1.42],[.575,1.985,-.505,.705],[-3.4,3.4,-3.65,-2.6],[1.84,2.32,-.64,-.16]];
const free=(x,z)=>x>=-3.42&&x<=3.42&&z>=-3.42&&z<=4.15&&!obstacles.some(([a,b,c,d])=>x>a&&x<b&&z>c&&z<d);
export function movePlayer(p,{forward=0,right=0},dt){
 const n=Math.max(1,Math.hypot(forward,right)),step=Math.min(Math.max(dt,0),.05)*1.65/n;
 const dx=(Math.sin(p.yaw)*forward+Math.cos(p.yaw)*right)*step;
 const dz=(-Math.cos(p.yaw)*forward+Math.sin(p.yaw)*right)*step;
 const next={...p};if(free(next.x+dx,next.z))next.x+=dx;if(free(next.x,next.z+dz))next.z+=dz;return next;
}
export function canObserve(p){
 const dx=1.28-p.x,dz=.1-p.z,dy=1.235-1.62,d=Math.hypot(dx,dz,dy);
 return d<1.55&&(dx*Math.sin(p.yaw)*Math.cos(p.pitch)-dz*Math.cos(p.yaw)*Math.cos(p.pitch)+dy*Math.sin(p.pitch))/d>.88;
}
