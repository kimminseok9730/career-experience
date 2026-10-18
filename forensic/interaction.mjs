import {STORAGE_KEY} from '../core/forensic-observation.mjs';
export function pickTissue(ray,model){
 return ray.intersectObject(model,true).find(hit=>hit.object.isMesh)??null;
}
export function persistObservation(state,storage,allowed=true){
 if(!allowed)return {ok:false,reason:'protected'};
 try{storage.setItem(STORAGE_KEY,JSON.stringify(state));return {ok:true};}
 catch{return {ok:false,reason:'unavailable'};}
}
export function normalizeYaw(value){return Math.atan2(Math.sin(value),Math.cos(value));}

