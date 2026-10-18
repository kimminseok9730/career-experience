// What the reader has saved, kept in this browser for now.
//
// Shaped like the server's /api/activity so that when accounts arrive only the inside of
// these functions changes. The store is passed in rather than reached for, which is why
// this file can be tested without a browser.

import {findJob} from './jobs.mjs';

export const ACTIVITY_KEY = 'dream.activity.v1';

// some privacy modes throw on the very act of touching localStorage
const store = () => {try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};

const clean = raw => {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return [];
 return Array.isArray(raw.saved)&&raw.saved.every(id=>typeof id==='string')?raw.saved:[];
};

export function readSaved(from=store()){
 try{ return clean(JSON.parse(from?.getItem(ACTIVITY_KEY)??'null')); }
 catch{ return []; }
}

export function isSaved(jobId,from=store()){return readSaved(from).includes(jobId);}

// Returns the list the screen should now draw, so saving never appears to do nothing
// even where the browser refuses to persist it.
export function toggleSaved(jobId,to=store()){
 if(!findJob(jobId))return readSaved(to);
 const current=readSaved(to);
 const next=current.includes(jobId)?current.filter(id=>id!==jobId):[...current,jobId];
 try{ to?.setItem(ACTIVITY_KEY,JSON.stringify({saved:next})); }catch{}
 return next;
}

// A job removed from the catalogue stays in storage but is not rendered, so an old
// save can never turn into a blank card.
export function savedJobs(from=store()){return readSaved(from).map(findJob).filter(Boolean);}

export function clearActivity(from=store()){
 try{ from?.removeItem(ACTIVITY_KEY); }catch{}
 return [];
}
