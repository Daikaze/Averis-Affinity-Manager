import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {AFFINITY_MAP} from '../scripts/catalog.mjs';
import {createFeatureData,getOwnedFeatureIdentity,planFeatureSync,planAffinityIconUpdates,
        syncActorAffinityIcons,syncActorFeatures} from '../scripts/features.mjs';
import {featureIconPath,isLegacyAffinityIcon} from '../scripts/feature-icons.mjs';
import {emptyState,grantAffinity,gmSetLevel} from '../scripts/engine.mjs';

test('all 65 Affinity level Features have distinct bundled vector artwork',()=>{
 let count=0;
 const paths=new Set();
 for(const aff of Object.values(AFFINITY_MAP)){
  if(aff.unavailable)continue;
  for(let level=1;level<=5;level++){
   const feat=createFeatureData(aff.id,level);
   assert.equal(feat.img,featureIconPath(aff.id,level));
   assert.ok(feat.img.startsWith('modules/averis-affinity-manager/assets/affinity-icons/'));
   assert.ok(!paths.has(feat.img),'No two different abilities should share their SVG icon file');
   paths.add(feat.img);
   const path=feat.img.replace(/^modules\/averis-affinity-manager\//,'');
   assert.ok(existsSync(path),'Release artwork missing: '+path);
   const svg=readFileSync(path,'utf8');
   assert.match(svg,/<svg\b/);
   assert.match(svg,/viewBox="0 0 128 128"/);
   assert.match(svg,new RegExp('Level '+['I','II','III','IV','V'][level-1]));
   assert.doesNotMatch(svg,/<script\b|(?:href|src)="https?:/i);
   count++;
  }
 }
 assert.equal(count,65);
 assert.equal(paths.size,65);
 assert.equal(readdirSync('assets/affinity-icons').filter(x=>x.endsWith('.svg')).length,65);
});
test('only blank or old default aura is eligible for automatic icon replacement',()=>{
 for(const path of ['',null,undefined,'icons/svg/aura.svg'])assert.equal(isLegacyAffinityIcon(path),true);
 for(const path of ['icons/magic/fire/flames-burning-orange.webp','modules/custom/my-icon.png','modules/averis-affinity-manager/assets/affinity-icons/fire-1.svg'])assert.equal(isLegacyAffinityIcon(path),false);
 assert.throws(()=>featureIconPath('thunder',1));
 assert.throws(()=>featureIconPath('fire',6));
});
test('older Features migrate their icon in-place; customized and unrelated images survive untouched',async()=>{
 const legacy={...createFeatureData('earth',1),id:'owned-old',img:'icons/svg/aura.svg'};
 const custom={...createFeatureData('earth',2),id:'custom-art',img:'modules/custom/icon.png'};
 const unrelated={id:'other-module',img:'icons/svg/aura.svg',type:'feat',flags:{}};
 const actor={items:{contents:[legacy,custom,unrelated]},updates:[],
   async updateEmbeddedDocuments(type,changes,options){
     assert.equal(type,'Item');
     assert.equal(options.averisAffinityManagedSync,true);
     this.updates.push(changes);
     for(const update of changes){
       const i=this.items.contents.find(v=>v.id===update._id);
       if(update.img)i.img=update.img;
     }
   }
 };
 assert.deepEqual(planAffinityIconUpdates(actor.items.contents),[{_id:'owned-old',img:featureIconPath('earth',1)}]);
 assert.equal(await syncActorAffinityIcons(actor),1);
 assert.equal(await syncActorAffinityIcons(actor),0);
 assert.equal(actor.updates.length,1);
 assert.equal(legacy.img,featureIconPath('earth',1));
 assert.equal(custom.img,'modules/custom/icon.png');
 assert.equal(unrelated.img,'icons/svg/aura.svg');
});
test('normal feature synchronization upgrades old art without deleting it or replacing activities',async()=>{
 const feat={...createFeatureData('fire',1),id:'same-item-id',img:'icons/svg/aura.svg'};
 const activityReference=feat.system.activities;
 const updates=[];
 const actor={items:{contents:[feat]},
  async createEmbeddedDocuments(){throw Error('Must not create feature duplicates');},
  async deleteEmbeddedDocuments(){throw Error('Must not delete existing features');},
  async updateEmbeddedDocuments(type,data){
    assert.equal(type,'Item');updates.push(...data);
    for(const update of data){if(update.img)feat.img=update.img;}
  }};
 const state=gmSetLevel(grantAffinity(emptyState(),'fire'),'fire',1);
 const result=await syncActorFeatures(actor,state);
 assert.equal(result.created,0);
 assert.equal(result.deleted,0);
 assert.equal(result.upgraded,1);
 assert.deepEqual(updates,[{_id:'same-item-id',img:featureIconPath('fire',1)}]);
 assert.strictEqual(feat.system.activities,activityReference);
 assert.equal(getOwnedFeatureIdentity(feat),'fire:1');
 assert.equal((await syncActorFeatures(actor,state)).upgraded,0);
});
test('a manually removed Feature is never recreated by artwork refresh',async()=>{
 const state=gmSetLevel(grantAffinity(emptyState(),'blood',{source:'gm-special'}),'blood',3);
 state.suppressedFeatures=['blood:2'];
 const items=[{...createFeatureData('blood',1),id:'one',img:'icons/svg/aura.svg'},
              {...createFeatureData('blood',3),id:'three',img:'icons/svg/aura.svg'}];
 const updates=planAffinityIconUpdates(items);
 assert.equal(updates.length,2);
 const plan=planFeatureSync(state,items);
 assert.equal(plan.creates.length,0);
 assert.equal(plan.deleteIds.length,0);
});
