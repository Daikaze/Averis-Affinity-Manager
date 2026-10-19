
import test from 'node:test';
import assert from 'node:assert/strict';
import {grantAffinity,gmSetLevel,emptyState} from '../scripts/engine.mjs';
import {createFeatureData} from '../scripts/features.mjs';

const callbacks=new Map(),calls=[],notifications=[];
let progress=gmSetLevel(grantAffinity(emptyState(),'fire'),'fire',1);
progress=gmSetLevel(grantAffinity(progress,'earth'),'earth',1);
const stored=[];
const actor={
 id:'test',uuid:'Actor.test',name:'Test Adventurer',type:'character',documentName:'Actor',
 system:{attributes:{prof:2}},items:{contents:stored,get:id=>stored.find(i=>i.id===id)},
 testUserPermission:()=>true,canUserModify:()=>true,
 getFlag(ns,key){return key==='progress'?progress:undefined;},
 async setFlag(ns,key,val){assert.equal(key,'progress');progress=val;return val;},
 async createEmbeddedDocuments(){throw Error('Use/Share must never create any Feature');},
 async deleteEmbeddedDocuments(type,ids){assert.equal(type,'Item');calls.push('delete:'+ids.join(','));for(const id of ids){const index=stored.findIndex(x=>x.id===id);if(index>=0)stored.splice(index,1);}},
 async updateEmbeddedDocuments(){throw Error('Use/Share must not update unrelated Features');}
};
function addFeature(id,level){
 const item=createFeatureData(id,level);
 item.id=id+'-'+level;
 item.system.activities={
  get(key){if(key==='affinityStrike' ||key==='affinityActivate')return {use:async()=>{calls.push(id+':'+level);return {id:'message'};}};return null;}
 };
 stored.push(item);return item;
}
addFeature('fire',1);addFeature('earth',1);
globalThis.game={user:{id:'gm',isGM:true},actors:{contents:[actor],get:id=>id==='test'?actor:null},
 users:{activeGM:{id:'gm',active:true}},settings:{register(){}},keybindings:{register(){}},
 modules:new Map([['averis-affinity-manager',{}]]),socket:{on(){}},time:{worldTime:0},system:{id:'dnd5e'}};
globalThis.Hooks={once(name,fn){callbacks.set(name,fn);},on(name,fn){callbacks.set(name,fn);}};
globalThis.ui={notifications:{warn(x){notifications.push(x);},info(){},error(x){notifications.push(x);}}};
globalThis.foundry={applications:{api:{ApplicationV2:class{},DialogV2:{confirm:async()=>true}}}};
await import('../scripts/main.js');callbacks.get('init')();
const api=game.modules.get('averis-affinity-manager').api;

test('Use/Share executes ONLY the requested Activity; leaves the other learned Feature alone',async()=>{
 await api.useSelected(actor,'fire',1);
 assert.deepEqual(calls,['fire:1']);
 assert.deepEqual(stored.map(x=>x.id),['fire-1','earth-1']);
 assert.equal(progress.usage['fire:1']??0,0); // Unlimited use is tracked as history only.
 assert.equal(progress.history.at(-1).id,'fire');
});
test('Missing manually removed Feature does NOT recreate another Affinity by using it',async()=>{
 const removed=stored.splice(1,1)[0];
 await assert.rejects(()=>api.useSelected(actor,'earth',1),/removed from the Character Sheet/);
 assert.deepEqual(stored.map(x=>x.id),['fire-1']);
 stored.push(removed);
});
test('GM removal is persistent in the Actor flags and does not trigger unrelated feature creation',async()=>{
 const apiRemove=api.removeAffinity;
 // Reuse existing activity mock, confirmation returns true
 assert.equal(await apiRemove(actor,'fire'),true);
 assert.equal(progress.known.fire,undefined);
 assert.ok(progress.known.earth);
 assert.equal(stored.find(x=>x.id==='fire-1'),undefined);
 assert.ok(stored.some(x=>x.id==='earth-1'));
});
