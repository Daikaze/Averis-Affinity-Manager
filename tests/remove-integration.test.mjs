import assert from 'node:assert/strict';
import test from 'node:test';
import {emptyState,grantAffinity,gmSetLevel} from '../scripts/engine.mjs';
import {createFeatureData} from '../scripts/features.mjs';

const hooks=new Map();
let confirmed=true,notice=[];
let progress=gmSetLevel(grantAffinity(emptyState(),'psychic'),'psychic',2);
const feats=[...Array.from({length:2},(_,i)=>({...createFeatureData('psychic',i+1),id:'managed-'+i})),{id:'homebrew',name:'Own Ability',type:'feat',flags:{}}];
const actor={
 id:'actor1',uuid:'Actor.actor1',name:'Test Hero',type:'character',documentName:'Actor',
 system:{attributes:{prof:2}},
 items:{contents:feats},
 testUserPermission:()=>true,canUserModify:()=>true,
 getFlag(ns,name){return name==='progress'?progress:undefined;},
 async setFlag(ns,name,value){assert.equal(name,'progress');progress=value;return value;},
 async deleteEmbeddedDocuments(type,ids){assert.equal(type,'Item');for(const id of ids){const index=feats.findIndex(x=>x.id===id);if(index>=0)feats.splice(index,1);}},
 async createEmbeddedDocuments(){throw Error('Unexpected create during removal');}
};
globalThis.game={
 user:{id:'gm',isGM:true},
 actors:{contents:[actor],get:id=>id===actor.id?actor:null},
 users:{activeGM:{id:'gm',active:true}},
 settings:{register(){}},
 keybindings:{register(){}},
 modules:new Map([['averis-affinity-manager',{}]]),
 socket:{on(){}},time:{worldTime:0},system:{id:'dnd5e'}
};
globalThis.Hooks={once(key,fn){hooks.set(key,fn);},on(key,fn){hooks.set(key,fn);}};
globalThis.ui={notifications:{warn(s){notice.push('warn:'+s);},error(s){notice.push('error:'+s);},info(s){notice.push('info:'+s);}}};
globalThis.foundry={applications:{api:{
 ApplicationV2:class {},
 DialogV2:{async confirm(){return confirmed;}}
}}};
await import('../scripts/main.js');
hooks.get('init')();
const api=game.modules.get('averis-affinity-manager').api;

test('GM can really remove learned Affinity and module-owned Character Features',async()=>{
 const success=await api.removeAffinity(actor,'psychic');
 assert.equal(success,true);
 assert.equal(progress.known.psychic,undefined);
 assert.deepEqual(feats.map(x=>x.id),['homebrew']);
 assert.ok(notice.some(s=>s.includes('Psychic Affinity removed')));
});
test('cancelling removal does not delete Affinity or Features',async()=>{
 progress=gmSetLevel(grantAffinity(emptyState(),'water'),'water',1);
 feats.push({...createFeatureData('water',1),id:'managed-water'});
 confirmed=false;
 const was=JSON.stringify(progress);
 const response=await api.removeAffinity(actor,'water');
 assert.equal(response,false);
 assert.equal(JSON.stringify(progress),was);
 assert.ok(feats.some(x=>x.id==='managed-water'));
});
test('only GM can remove Affinity',async()=>{
 game.user.isGM=false;
 await assert.rejects(()=>api.removeAffinity(actor,'water'),/GM only/);
 game.user.isGM=true;
});
