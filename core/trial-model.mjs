// Educational coupled curves, not equipment limits or an electrical/hydraulic solver.
const round=(v,d=0)=>Number(v.toFixed(d));
export function trialSample(elapsed,resolved){
 const t=Math.max(0,Math.min(120,elapsed)),d=resolved?0:Math.min(1,t/60);
 return {voltage:[400,round(399-60*d),round(401-2*d)],current:[round(66+14*d),round(68+46*d),round(67+16*d)],process:[round(3.2-2*d,2),round(.35-.2*d,2),d>=.5?1:0],
  // Constant training inflow6 and A outflow3.2 m³/min, pit area4m².
  waterDelta:(-.4*t+(resolved?0:(t<=60?t*t/60:60+2*(t-60))))/240};
}
