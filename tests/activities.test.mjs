import test from 'node:test';
import assert from 'node:assert/strict';
import {AFFINITIES} from '../scripts/catalog.mjs';
import {makeActivityBundle,damageParts} from '../scripts/activities.mjs';
import {createFeatureData} from '../scripts/features.mjs';
test('each of the 65 abilities has at least one native DnD5e 5.3.3 activity',()=>{
 let n=0;
 for(const a of AFFINITIES)for(const ability of a.abilities){
  const data=createFeatureData(a.id,ability.level);
  assert.equal(data.type,'feat');
  const activities=data.system.activities;
  assert.equal(activities.affinityActivate.type,'utility');
  for(const [key,activity] of Object.entries(activities)){
   assert.equal(activity._id,key);
   assert.ok(['attack','damage','heal','utility'].includes(activity.type));
   assert.deepEqual(activity.consumption.targets,[]);
   assert.equal(activity.consumption.spellSlot,false);
   assert.doesNotMatch(JSON.stringify(activity),/DC\s*[:\-]?\s*\d{2}\b/i);
  }
  n++;
 }
 assert.equal(n,65);
});
test('direct spell attack gets Attack activity with explicit attack classification and damage',()=>{
 const a=AFFINITIES.find(x=>x.id==='fire').abilities[0];
 const acts=makeActivityBundle(a);
 assert.equal(acts.affinityStrike.type,'attack');
 assert.equal(acts.affinityStrike.attack.type.classification,'spell');
 assert.equal(acts.affinityStrike.attack.type.value,'ranged');
 assert.equal(acts.affinityStrike.damage.parts[0].number,1);
 assert.equal(acts.affinityStrike.damage.parts[0].denomination,10);
 assert.deepEqual(acts.affinityStrike.damage.parts[0].types,['fire']);
});
test('conditional movement-trigger damage is a separate optional roll not instant auto-damage',()=>{
 const a=AFFINITIES.find(x=>x.id==='wind').abilities[0];
 const acts=makeActivityBundle(a);
 assert.equal(acts.affinityActivate.type,'utility');
 assert.ok(acts.affinityDamage||acts.affinityActivate);
 assert.equal(acts.affinityStrike,undefined);
});
test('variable saves do not reveal private GM DC in native item activities',()=>{
 for(const affinity of AFFINITIES)for(const ability of affinity.abilities){
  const blob=JSON.stringify(makeActivityBundle(ability));
  assert.doesNotMatch(blob,/"save"\s*:\s*\{/i);
  assert.doesNotMatch(blob,/\bDC\s*\d{2}\b/i);
 }
});
test('damage parser requires damage word and damage type, never turns incidental dice into damage',()=>{
 assert.equal(damageParts('Gains 1d8 Temporary HP').length,0);
 assert.equal(damageParts('1d8 Force Damage')[0].types[0],'force');
});
