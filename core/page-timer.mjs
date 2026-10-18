// One interval that survives back-forward cache restores. Starting always releases the previous
// handle first, so a restore can never leave two timers advancing training time in parallel.
export function createPageTimer(tick,{interval=1000,timers=globalThis,events=globalThis}={}){
 let id=null;
 const stop=()=>{if(id!==null){timers.clearInterval(id);id=null;}};
 const start=()=>{stop();id=timers.setInterval(tick,interval);};
 events.addEventListener('pagehide',stop);
 events.addEventListener('pageshow',start);
 start();
}
