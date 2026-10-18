// Metres relative to gallery floor. Internal layout is a reconstruction, not surveyed.
export const blocks = [
 [-4.4,-4.1,-4.95,4.95], [4.1,4.4,-4.95,4.95], [-4.4,4.4,-4.95,-4.65],
 [-4.4,1.95,4.65,4.95], [3.55,4.4,4.65,4.95],
 [-4.1,.8,-2.65,-2.5], [2.25,4.1,-2.65,-2.5],
 [-1.95,1.95,.15,2.85],
 [-3.92,-3.07,-4.7,-3.82], [-2.9,-1.06,-4.6,-3.94], [-.83,1.49,-4.61,-3.92],
 [2.37,3.43,-4.23,-3.62],
 [-2.4,1.7,-1.3,-.55], [-3.9,-3.2,.3,1.2],
 [-5.4,-4.6,7.35,10.65], [4.6,5.4,7.35,10.65],
];
export const zones = [[-4.1,4.1,-4.65,4.95], [1.95,3.55,4.3,5.6], [-7,7,4.95,13]];
export function canStand(x,z,r=.22){
 const covered=zones.some(([a,b,c,d])=>x>=a+r&&x<=b-r&&z>=c+r&&z<=d-r);
 return covered&&!blocks.some(([a,b,c,d])=>x>a-r&&x<b+r&&z>c-r&&z<d+r);
}
export function move(p,dx,dz){
 const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));let x=p.x,z=p.z;
 for(let i=0;i<n;i++){if(canStand(x+dx/n,z))x+=dx/n;if(canStand(x,z+dz/n))z+=dz/n}
 return {...p,x,z};
}
export function look(p,dx,dy){return {...p,yaw:p.yaw-dx*.003,pitch:Math.max(-1.45,Math.min(1.45,p.pitch-dy*.003))}}
// Camera -Z is forward; D strafes right independently of avatar rotation.
export function cameraMovement(yaw,forward,strafe,dt,speed=1.7){
 const length=Math.max(1,Math.hypot(forward,strafe));
 const step=Math.min(.05,Math.max(0,dt))*speed/length;
 return {x:(-Math.sin(yaw)*forward+Math.cos(yaw)*strafe)*step,z:(-Math.cos(yaw)*forward-Math.sin(yaw)*strafe)*step};
}
