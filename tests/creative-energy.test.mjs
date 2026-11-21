import test from "node:test";
import assert from "node:assert/strict";
import {proficiencyFromActor,energyState,spendCreativeEnergy,recoverEnergy,setEnergyCurrent,setEnergyMaximum,setBurnout} from "../scripts/creative-energy.mjs";
import {emptyState,gmAssignNpcAffinity,knownCount,visibleAffinityCatalog,normalizeState} from "../scripts/engine.mjs";

test("Energy is PB-based for PCs and NPCs, including CR > 20",()=>{
 const pc={type:"character",system:{attributes:{prof:2}}};
 const npc={type:"npc",system:{attributes:{prof:7},details:{cr:22}}};
 const fallback={type:"npc",system:{attributes:{},details:{cr:30}}};
 assert.equal(proficiencyFromActor(pc),2);
 assert.equal(proficiencyFromActor(npc),7);
 assert.equal(proficiencyFromActor(fallback),9);
 assert.deepEqual(energyState(null,2),{current:2,max:2,maxOverride:null,overloadUsed:false,burnout:false});
});
test("Creative actions spend only their GM-set cost and never mutate a granted spell resource",()=>{
 const original={current:3,overloadUsed:false,burnout:false};
 const out=spendCreativeEnergy(original,3,2,"normal");
 assert.equal(out.state.current,1);assert.equal(out.strain,0);
 assert.deepEqual(original,{current:3,overloadUsed:false,burnout:false});
 assert.throws(()=>spendCreativeEnergy(out.state,3,2,"normal"),/Not enough/);
 assert.throws(()=>spendCreativeEnergy(null,2,0,"normal"));
 assert.throws(()=>spendCreativeEnergy(null,2,7,"normal"));
});
test("Short rest +1; Long rest resets both energy, overload and burnout",()=>{
 const spent=spendCreativeEnergy({current:1},2,2,"forced");
 assert.equal(spent.state.current,0);
 assert.equal(spent.state.overloadUsed,true);
 assert.equal(spent.strain,1);assert.equal(spent.dc,12);
 const failed=setBurnout(spent.state,2,true);
 assert.throws(()=>spendCreativeEnergy(failed,2,1,"normal"),/Burnout/);
 assert.equal(recoverEnergy(failed,2,"short").current,1);
 assert.equal(recoverEnergy(failed,2,"short").burnout,true);
 assert.deepEqual(energyState(recoverEnergy(failed,2,"long"),2),{current:2,max:2,maxOverride:null,overloadUsed:false,burnout:false});
});
test("Forced activation only for a deficit (max 3); empowered uses full normal cost",()=>{
 assert.throws(()=>spendCreativeEnergy({current:1},2,5,"forced"),/strain/);
 assert.throws(()=>spendCreativeEnergy({current:1},2,2,"empowered"),/full normal/);
 const forced=spendCreativeEnergy({current:0},2,3,"forced");
 assert.equal(forced.strain,3);assert.equal(forced.dc,16);
 assert.throws(()=>spendCreativeEnergy(forced.state,2,1,"forced"),/already/);
 const empowered=spendCreativeEnergy({current:2},2,2,"empowered");
 assert.equal(empowered.state.current,0);
 assert.equal(empowered.strain,1);
});
test("GM override for Boss NPC can exceed normal PB; adjusting max clamps current",()=>{
 const elevated=setEnergyMaximum({current:2},3,8);
 assert.equal(energyState(elevated,3).max,8);
 assert.equal(setEnergyCurrent(elevated,3,7).current,7);
 const back=setEnergyMaximum(setEnergyCurrent(elevated,3,7),3,null);
 assert.equal(energyState(back,3).max,3);
 assert.equal(energyState(back,3).current,3);
});
test("GM NPC level assignment grants all levels directly, preserves hidden player visibility",()=>{
 let s=gmAssignNpcAffinity(emptyState(),"fire",3);
 assert.equal(s.known.fire.level,3);
 s=gmAssignNpcAffinity(s,"blood",2);
 assert.equal(s.known.blood.level,2);
 assert.deepEqual(visibleAffinityCatalog(s,false).map(x=>x.id),["fire","blood"]);
 for(const id of ["earth","wind","water"])s=gmAssignNpcAffinity(s,id,1);
 assert.equal(knownCount(s),4,"NPC GM assignment may exceed PC's normal affinity cap");
 assert.equal(normalizeState(s).known.water.level,1);
 assert.throws(()=>gmAssignNpcAffinity(s,"fire",6));
 assert.throws(()=>gmAssignNpcAffinity(s,"thunder",1));
});
