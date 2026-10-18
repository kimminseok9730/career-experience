// Pure mesh data, kept separate so face orientation can be checked without WebGL.
export function heartSurfaceData(){
 const positions=[],indices=[],rows=52,cols=72;
 for(let j=0;j<=rows;j++){
  const t=j/rows,angle=Math.PI*t;
  const radius=Math.pow(Math.sin(angle),.79)*(1-.24*t);
  for(let i=0;i<=cols;i++){
   const p=i/cols*Math.PI*2;
   const groove=1-.055*Math.exp(-Math.pow(Math.atan2(Math.sin(p-1.1),Math.cos(p-1.1))/.15,2));
   positions.push(radius*Math.cos(p)*.87*groove+.27*t*t,1.08-2.12*t,radius*Math.sin(p)*.61*groove);
   if(i<cols&&j<rows){const k=j*(cols+1)+i;indices.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);}
  }
 }
 return {positions,indices};
}

