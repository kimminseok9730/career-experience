// WCAG contrast, and the least darkening that makes a colour readable as small text.
//
// Category colours are picked for tiles and icons. As 12px text on a white card most of them
// fall short of 4.5:1, so the text takes a darker shade of the same hue rather than a new
// colour — a category keeps looking like itself, and a new category is covered automatically.

const channels = color => color.replace('#','').match(/../g).map(pair => parseInt(pair,16));
const linear = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
const luminance = ([r,g,b]) => .2126*linear(r) + .7152*linear(g) + .0722*linear(b);
const toHex = rgb => '#' + rgb.map(v => Math.round(v).toString(16).padStart(2,'0')).join('');

export function contrast(a,b){
 const [x,y] = [luminance(channels(a)), luminance(channels(b))];
 return (Math.max(x,y) + .05) / (Math.min(x,y) + .05);
}

// Mixes toward black in small steps and stops at the first shade that clears the ratio,
// so the hue survives and the colour goes no darker than it has to.
export function readableOn(color,background='#ffffff',min=4.5){
 if(contrast(color,background) >= min) return color;
 const rgb = channels(color);
 for(let step = 1; step <= 50; step++){
  const shade = toHex(rgb.map(v => v * (1 - step/50)));
  if(contrast(shade,background) >= min) return shade;
 }
 return '#000000';
}
