import test from 'node:test';
import assert from 'node:assert/strict';
import {AFFINITY_MAP} from '../scripts/catalog.mjs';
import {grantAffinity,gmSetLevel,removeAffinity,emptyState} from '../scripts/engine.mjs';
import {planFeatureSync,createFeatureData,syncActorFeatures,getOwnedFeatureIdentity} from '../scripts/features.mjs';

function mockActor(){
 const items=[];
 let counter=0;
 return {
  items:{contents:items},
  async createEmbeddedDocuments(type,data){
   assert.equal(type,'Item');
   for(const source of data)items.push({...structuredClone(source),id:'feature-'+(++counter)});
   return data;
  },
  async deleteEmbeddedDocuments(type,ids){
   assert.equal(type,'Item');
   for(const id of ids){const at=items.findIndex(item=>item.id===id);if(at>=0)items.splice(at,1);}
   return ids;
  }
 };
}
const withLevel=(id,level)=>gmSetLevel(grantAffinity(emptyState(),id),id,level);
test('creates a native D&D 5e feat Feature for every unlocked Affinity Level',()=>{
 const s=withLevel('fire',5);
 const plan=planFeatureSync(s,[]);
 assert.equal(plan.expectedCount,5);
 assert.equal(plan.creates.length,5);
 const levels=plan.creates.map(item=>item.flags['averis-affinity-manager'].abilityLevel);
 assert.deepEqual(levels,[1,2,3,4,5]);
 for(const f of plan.creates){
  assert.equal(f.type,'feat');
  assert.match(f.name,/Fire Affinity/);
  assert.match(f.system.description.value,/Averis Affinity Manager/);
  assert.ok(f.flags['averis-affinity-manager'].managedFeature);
 }
});
test('all 65 affinity Features contain canonical names and no numeric saving DC',()=>{
 for(const aff of Object.values(AFFINITY_MAP)){
  if(aff.unavailable)continue;
  for(let level=1;level<=5;level++){
   const item=createFeatureData(aff.id,level);
   assert.ok(item.name.includes(aff.abilities[level-1].title));
   const html=item.system.description.value;
   assert.doesNotMatch(html,/\bDC\s*[—:\-()\s]*\d{1,3}\b/i,`${aff.id} Level ${level}`);
   assert.doesNotMatch(html,/<script/i);
  }
 }
});
test('sync at Level 0 does not grant abilities; Level 1 and 3 grant exact counts',async()=>{
 const actor=mockActor();
 let s=grantAffinity(emptyState(),'water');
 assert.deepEqual(await syncActorFeatures(actor,s),{created:0,deleted:0,expectedCount:0});
 s=gmSetLevel(s,'water',1);
 assert.equal((await syncActorFeatures(actor,s)).created,1);
 assert.equal(actor.items.contents.length,1);
 s=gmSetLevel(s,'water',3);
 assert.equal((await syncActorFeatures(actor,s)).created,2);
 assert.equal(actor.items.contents.length,3);
 assert.equal((await syncActorFeatures(actor,s)).created,0);
 assert.equal((await syncActorFeatures(actor,s)).deleted,0);
});
test('remove deletes only manager tagged Features, never other custom or manually named features',async()=>{
 const actor=mockActor();
 let s=withLevel('psychic',4);
 await syncActorFeatures(actor,s);
 const handmade={id:'handmade',name:'Psychic Affinity — Sensory Split',type:'feat',flags:{},system:{description:{value:'do not touch'}}};
 actor.items.contents.push(handmade);
 const other={id:'other',name:'Shared Mind',type:'feat',flags:{'another-module':{managedFeature:true}}};
 actor.items.contents.push(other);
 s=removeAffinity(s,'psychic');
 const result=await syncActorFeatures(actor,s);
 assert.equal(result.deleted,4);
 assert.equal(result.created,0);
 assert.deepEqual(actor.items.contents.map(x=>x.id),['handmade','other']);
 assert.deepEqual(s.known,{});
});
test('level decreases remove only higher-level features; other Affinities stay untouched',async()=>{
 const actor=mockActor();
 let s=grantAffinity(withLevel('fire',5),'blood',{source:'gm-special'});
 s=gmSetLevel(s,'blood',2);
 await syncActorFeatures(actor,s);
 assert.equal(actor.items.contents.length,7);
 s=gmSetLevel(s,'fire',2);
 const result=await syncActorFeatures(actor,s);
 assert.equal(result.deleted,3);
 assert.equal(actor.items.contents.length,4);
 assert.equal(actor.items.contents.filter(x=>x.flags['averis-affinity-manager'].affinityId==='blood').length,2);
});
test('duplicate module items are safely cleaned without deleting untagged items',async()=>{
 const actor=mockActor();
 const s=withLevel('earth',1);
 const feat=createFeatureData('earth',1);
 actor.items.contents.push({...feat,id:'one'},{...feat,id:'two'});
 const result=await syncActorFeatures(actor,s);
 assert.equal(result.deleted,1);
 assert.equal(result.created,0);
 assert.equal(actor.items.contents.length,1);
 assert.equal(getOwnedFeatureIdentity(actor.items.contents[0]),'earth:1');
});
test('a failure in embedded operations is propagated and can be retried',async()=>{
 const actor=mockActor();
 const state=withLevel('ice',1);
 actor.createEmbeddedDocuments=async()=>{throw Error('Simulated database error');};
 await assert.rejects(()=>syncActorFeatures(actor,state),/Simulated database error/);
 actor.createEmbeddedDocuments=async(type,items)=>{actor.items.contents.push(...items.map((v,i)=>({...v,id:'recovery-'+i})));};
 assert.equal((await syncActorFeatures(actor,state)).created,1);
 assert.equal((await syncActorFeatures(actor,state)).created,0);
});
