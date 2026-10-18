// The reader's own settings, kept in this browser for now.
//
// The shape is the one a server-backed profile will use, so when accounts arrive only the
// inside of these functions changes — every screen keeps calling the same three functions.
// The store is passed in rather than reached for, which is why this file can be tested.

import {LEVELS} from './jobs.mjs';

export const PROFILE_KEY = 'dream.profile.v1';

const BANDS = LEVELS.map(level => level.id);

export function defaultProfile(){return {gradeBand:BANDS[0]};}

const clean = raw => {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 return BANDS.includes(raw.gradeBand)?{gradeBand:raw.gradeBand}:null;
};

// some privacy modes throw on the very act of touching localStorage
const store = () => {try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};

export function readProfile(from=store()){
 try{ return clean(JSON.parse(from?.getItem(PROFILE_KEY)??'null')) ?? defaultProfile(); }
 catch{ return defaultProfile(); }
}

// Returns the profile the screen should now draw. A browser that refuses to store
// still gets the new value back, so choosing a level never appears to do nothing.
export function saveProfile(patch={},to=store()){
 const next = clean({...readProfile(to),...patch}) ?? readProfile(to);
 try{ to?.setItem(PROFILE_KEY,JSON.stringify(next)); }catch{}
 return next;
}

export function clearProfile(from=store()){
 try{ from?.removeItem(PROFILE_KEY); }catch{}
 return defaultProfile();
}
