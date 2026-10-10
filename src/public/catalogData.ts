export const catalogImage = (name: string) => `/images/catalog/${name}${["fold-object", "fold-detail", "fold-wall", "fold-edge", "voxy-object", "voxy-wall", "voxy-room"].includes(name) ? "-studio" : ""}.webp`;
export const finishes = [
 {name:'Chalk',hex:'#e1ded5'}, {name:'Ivory',hex:'#d4cbb9'}, {name:'Sand',hex:'#b7a48b'},
 {name:'Mist',hex:'#a8aaa5'}, {name:'Stone',hex:'#82827b'}, {name:'Charcoal',hex:'#444643'},
];
export const designCollection = [
 {slug:'fold',name:'Fold',family:'Angular relief',description:'A folded plane. A changing shadow. A precise geometry that transforms as the light moves.',size:'Dimensions on enquiry',depth:'To be confirmed for the selected design',revision:'Studio concept',views:[['object','The form'],['detail','Surface detail'],['wall','The repeat'],['edge','Edge profile'],['room','In a room']]},
 {slug:'voxy',name:'Voxy',family:'Flowing relief',description:'Broad, continuous ribbons bring movement to a wall. Soft crests and deep recesses create a quieter rhythm.',size:'Dimensions on enquiry',depth:'To be confirmed',revision:'Earlier ribbon study',views:[['object','The form'],['wall','The repeat'],['room','In a room']]},
];
export const sampleBoxes = [
 {id:'form',name:'Form & Finish',description:'Explore relief, scale and colour together. A portfolio of miniature forms with a separate finish-chip drawer.',contents:'Four miniature forms · six finish chips · pattern guide'},
 {id:'colour',name:'Colour & Texture',description:'Compare a wider mineral palette alongside tactile surface treatments.',contents:'Twenty colour chips · texture comparison plaque'},
 {id:'six',name:'Essential Finishes',description:'A compact starting point for comparing concrete tones in your own space.',contents:'Six finish chips · fitted presentation case'},
];
