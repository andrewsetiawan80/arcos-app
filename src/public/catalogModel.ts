import {panelCollection} from './panelCollection';
import {tileCollection} from './tileCollection';
import {catalogImage} from './catalogData';
/** Public catalogue content contract. Add data here; category, product and spec layouts are shared. */
export type CatalogType = 'wall-tiles'|'panels'|'floor-tiles'|'seamless';
export type CatalogMedia = {src:string; label:string; note:string};
export type CatalogEntry = {
 slug:string; name:string; type:CatalogType; collection:string; material:string;
 description:string; status:'Design study'|'Mockup concept'|'Published';
 format:{width:number;height:number;depth:number}|null;
 technicalDrawing?:string; specificationNote?:string;
 textures:string[]; images:CatalogMedia[]; application:string; dimensionNote:string;
};
export const catalogTypes = [
 {id:'wall-tiles',name:'Wall tiles',description:'Relief, rhythm and shadow.',image:catalogImage('fold-wall')},
 {id:'panels',name:'Panels',description:'A larger architectural canvas.',image:'/images/catalog/panel-four-room.webp'},
 {id:'floor-tiles',name:'Floor tiles',description:'A considered foundation.',image:'/images/editorial/material-interior.webp'},
 {id:'seamless',name:'Seamless finishes',description:'Microcement, without tile joints.',image:'/images/inspiration/textured-microcement-01.webp'},
] as const;
export const catalogCollections = [
 {id:'sculptural',name:'Sculptural',type:'wall-tiles'},
 {id:'linear',name:'Linear',type:'wall-tiles'},
 {id:'mineral-relief',name:'Mineral Relief',type:'wall-tiles'},
 {id:'plane',name:'Plane',type:'panels'},
 {id:'field',name:'Field',type:'floor-tiles'},
 {id:'mineral',name:'Mineral',type:'seamless'},
] as const;
const studio=(slug:string,view:string,label:string):CatalogMedia=>({src:catalogImage(`${slug}-${view}`),label,note:'Studio visualisation / design intent'});
const concept=(src:string,label:string):CatalogMedia=>({src,label,note:'Mockup image / proposed product, not a completed installation'});
const proposed='Illustrative mockup dimensions. Geometry, tolerances and production specification require confirmation.';
export const catalogEntries:CatalogEntry[]=[
 {slug:'kraken',name:'Kraken',type:'wall-tiles',collection:'sculptural',material:'GFRC / UHPC',status:'Design study',description:'An interlocking ribbon of concrete. Angled relief catches the light, building a continuous rhythm across the wall.',format:{width:196.495,height:280.843,depth:30.579},technicalDrawing:'/images/catalog/kraken-dimensions.svg',specificationNote:'Sculptural concrete wall tile',dimensionNote:'Overall dimensions shown for design coordination. Confirm final dimensions, tolerances and finish with your approved sample before ordering.',textures:['Fine matte','Custom finish enquiry'],application:'Feature walls / project-specific installation',images:[{src:'/images/catalog/kraken-room.png',label:'Room',note:'Kraken in a warm, contemporary interior. Product visualisation.'},{src:'/images/catalog/kraken-tile-polished.png',label:'Tile',note:'The sculptural module in charcoal. Product visualisation.'},{src:'/images/catalog/kraken-detail-polished.png',label:'Detail',note:'Light reveals the relief and mineral texture. Product visualisation.'},{src:'/images/catalog/kraken-pattern-polished.png',label:'Pattern',note:'A continuous rhythm across the wall. Product visualisation.'},{src:'/images/catalog/kraken-texture-polished.png',label:'Texture',note:'Concrete surface and tonal variation. Product visualisation.'}]},

 {slug:'fold',name:'Fold',type:'wall-tiles',collection:'sculptural',material:'GFRC',status:'Design study',description:'Two opposed ramps, each with a two-stage slope and a central bend that creates a changing rhythm of light and shadow.',format:{width:300,height:300,depth:55},dimensionNote:'300 × 300 mm tile; maximum depth 55 mm. Each ramp changes slope at 150 mm, with a 55 → 41 → 8 mm profile. Final production tolerances confirmed on enquiry.',textures:['Fine matte','Custom finish enquiry'],application:'Feature walls / suitability reviewed by project',images:[studio('fold','object','Tile'),studio('fold','detail','Detail'),studio('fold','wall','Pattern'),studio('fold','room','Room'),studio('fold','edge','Profile')]},
 {slug:'voxy',name:'Voxy',type:'wall-tiles',collection:'sculptural',material:'GFRC',status:'Design study',description:'Slender flowing ribbons build a surface with a soft, continuous rhythm.',format:{width:300,height:240,depth:30},dimensionNote:proposed+' The earlier polished ribbon study is shown; these dimensions are placeholders, not its measured CAD dimensions.',textures:['Fine matte','Custom finish enquiry'],application:'Feature walls / suitability reviewed by project',images:[studio('voxy','object','Tile'),studio('voxy','wall','Pattern'),studio('voxy','room','Room')]},
 ...tileCollection,
 ...panelCollection,
 ...([{slug:'field-square',name:'Field / Square',format:{width:600,height:600,depth:20},art:'floor-square'},{slug:'field-rectangle',name:'Field / Rectangle',format:{width:600,height:300,depth:20},art:'floor-rectangle'}].map(p=>({...p,type:'floor-tiles' as const,collection:'field',material:'GFRC / UHPC',status:'Mockup concept' as const,description:'A mineral surface with subtle variation, designed to bring calm to the floor.',dimensionNote:proposed,textures:['Honed concept','Textured enquiry'],application:'Flooring concept / slip, wear and sealing performance unverified',images:[concept(`/images/catalog/${p.art}.svg`,'Tile'),concept(`/images/catalog/${p.art}-pattern.svg`,'Pattern'),concept('/images/editorial/material-interior.webp','Room')]}))),
 ...([{slug:'mineral-fine',name:'Mineral / Fine',room:'textured-microcement-03',texture:'Fine matte'},{slug:'mineral-textured',name:'Mineral / Textured',room:'textured-microcement-01',texture:'Textured matte'}].map(p=>({...p,type:'seamless' as const,collection:'mineral',material:'Microcement',status:'Mockup concept' as const,description:'A continuous hand-applied finish. Colour and trowel movement become part of the architecture.',format:null,dimensionNote:'No tile module. Build-up and coat thickness depend on the substrate and approved system; confirm by project.',textures:[p.texture,'Custom finish enquiry'],application:'Walls and selected floors / substrate and system approval required',images:[concept(`/images/catalog/${p.slug==='mineral-textured'?'mineral-textured':'mineral-detail'}.svg`,'Material'),concept(`/images/inspiration/${p.room}.webp`,'Room')]}))),
];
export const collectionName=(id:string)=>catalogCollections.find(c=>c.id===id)?.name||id;
export const typeName=(id:string)=>catalogTypes.find(c=>c.id===id)?.name||id;
export const formatLabel=(p:CatalogEntry)=>p.format?`${p.format.width} × ${p.format.height} × ${p.format.depth} mm`:p.type==='seamless'?'Continuous / specified by area':'Dimensions on enquiry';
export function selectCatalog(entries:CatalogEntry[],filters:{type:string;collection:string;material:string;query:string},requestedPage:number,pageSize=12){
 const filtered=entries.filter(p=>(!filters.type||p.type===filters.type)&&(!filters.collection||p.collection===filters.collection)&&(!filters.material||p.material===filters.material)&&(`${p.name} ${collectionName(p.collection)} ${p.material}`.toLowerCase().includes(filters.query.toLowerCase())));
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize));const page=Math.min(Math.max(1,Math.floor(requestedPage)||1),pages);
 return {filtered,items:filtered.slice((page-1)*pageSize,page*pageSize),page,pages};
}
