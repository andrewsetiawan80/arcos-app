import {describe,it,expect} from 'vitest';
import {catalogEntries,catalogTypes,catalogCollections,selectCatalog,formatLabel} from './catalogModel';
describe('Reusable catalogue data contract',()=>{
 it('connects every product to a valid type and matching collection',()=>{expect(new Set(catalogEntries.map(p=>p.slug)).size).toBe(catalogEntries.length);for(const p of catalogEntries){expect(catalogTypes.some(c=>c.id===p.type)).toBe(true);expect(catalogCollections.some(c=>c.id===p.collection&&c.type===p.type)).toBe(true);expect(p.images.length).toBeGreaterThan(1);expect(p.dimensionNote).toBeTruthy();}});
 it('treats microcement as a seamless system, not a tile module',()=>{for(const p of catalogEntries.filter(p=>p.material==='Microcement')){expect(p.type).toBe('seamless');expect(p.format).toBeNull();expect(formatLabel(p)).toContain('Continuous');}});
 it('combines category, collection, material and name filters',()=>{const r=selectCatalog(catalogEntries,{type:'panels',collection:'plane',material:'GFRC',query:'square'},1);expect(r.items.map(p=>p.slug)).toEqual(['plane-square']);});
 it('paginates a growing catalogue with a bounded page size and clamps invalid pages',()=>{const many=Array.from({length:31},(_,i)=>({...catalogEntries[0],slug:`test-${i}`}));const f={type:'',collection:'',material:'',query:''};expect(selectCatalog(many,f,1).items).toHaveLength(12);expect(selectCatalog(many,f,2).items[0].slug).toBe('test-12');expect(selectCatalog(many,f,999).items).toHaveLength(7);expect(selectCatalog(many,f,-1).page).toBe(1);});
});
