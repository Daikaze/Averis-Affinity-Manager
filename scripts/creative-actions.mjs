import {MODULE_ID,normalizeState} from "./engine.mjs";
import {proficiencyFromActor,energyState,spendCreativeEnergy,setBurnout,recoverEnergy,setEnergyCurrent,setEnergyMaximum} from "./creative-energy.mjs";

const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const locks=new Set();
export const creativeState=actor=>energyState(actor?.getFlag?.(MODULE_ID,"creativeEnergy"),proficiencyFromActor(actor));
export const hasAffinity=(actor,id)=>!!normalizeState(actor?.getFlag?.(MODULE_ID,"progress")).known[id];
export const anyAffinity=actor=>Object.keys(normalizeState(actor?.getFlag?.(MODULE_ID,"progress")).known).length>0;

async function writeEnergy(actor,fn){
  if(!actor?.canUserModify?.(game.user,"update"))throw Error("No Actor update permission.");
  if(actor.type==="npc"&&!game.user?.isGM)throw Error("NPC Affinities are GM-controlled.");
  const id=actor.uuid??actor.id;
  if(locks.has(id))throw Error("Creative Energy update already running.");
  locks.add(id);
  try {
    const old=actor.getFlag(MODULE_ID,"creativeEnergy"),pb=proficiencyFromActor(actor);
    const value=fn(old,pb);
    await actor.setFlag(MODULE_ID,"creativeEnergy",value);
    return value;
  } finally {locks.delete(id);}
}

export async function recoverCreative(actor,kind){
  if(!anyAffinity(actor))return null;
  return writeEnergy(actor,(old,pb)=>recoverEnergy(old,pb,kind));
}
export async function gmClearBurnout(actor){
  if(!game.user?.isGM)throw Error("GM only.");
  return writeEnergy(actor,(old,pb)=>setBurnout(old,pb,false));
}
export async function gmEnergyOverride(actor,input){
  if(!game.user?.isGM)throw Error("GM only.");
  const raw=await input("GM · Creative Energy Settings",
    '<p>Manual maximum applies to this Actor only. Leave blank to use PB.</p>'+
    '<label>Max Energy override (1–12; blank = PB)<input name="override" type="number" min="1" max="12" placeholder="Automatic (PB)"></label>'+
    '<label>Current Energy<input name="current" type="number" min="0" max="12" required></label>',"Save Energy");
  if(!raw)return null;
  const override=String(raw.override??"").trim()===""?null:Number(raw.override);
  return writeEnergy(actor,(old,pb)=>{
    const withMax=setEnergyMaximum(old,pb,override);
    return setEnergyCurrent(withMax,pb,Number(raw.current));
  });
}

export async function spendCreative(actor,id,mode,input){
  if(!hasAffinity(actor,id))throw Error("The chosen Affinity has not been unlocked.");
  if(actor.type==="npc"&&!game.user?.isGM)throw Error("Only the GM can use NPC Affinities.");
  const raw=await input("Creative Affinity Action · "+id,
    '<p>Only GM-approved improvised/homebrew actions use Creative Energy. Granted spells and Features are unaffected.</p>'+
    '<label>Action description<input name="description" type="text" maxlength="180" required placeholder="What does the Affinity do?"></label>'+
    '<label>Energy Cost (assigned by GM)<select name="cost">'+
    [1,2,3,4,5,6].map(n=>'<option value="'+n+'"'+(n===2?' selected':'')+'>'+n+' Energy</option>').join("")+
    '</select></label>'+
    '<p>Activation mode: <b>'+escapeHTML(mode==="forced"?"Forced Activation":mode==="empowered"?"Empowered Overload":"Normal")+'</b></p>'+
    '<p>DM must approve the effect and Energy cost before activation. Maximum = PB.</p>',
    "Spend Energy");
  if(!raw)return null;
  const description=String(raw.description??"").trim().slice(0,180);
  if(!description)throw Error("Describe the custom action.");
  const cost=Number(raw.cost);
  // Compute validation again inside the locked update so stale UI cannot overspend.
  let outcome;
  await writeEnergy(actor,(old,pb)=>{
    outcome=spendCreativeEnergy(old,pb,cost,mode);
    return outcome.state;
  });
  let resultHTML='<p>Spent <b>'+outcome.spent+' Energy</b> for a GM-approved improvised Affinity action.</p>';
  if(outcome.strain){
    const rollData=actor.getRollData?.()??{};
    const flat=rollData?.abilities?.con?.save?.value??actor.system?.abilities?.con?.save?.value??actor.system?.abilities?.con?.mod??0;
    const bonus=Number(flat);
    const save=await(new Roll("1d20 + @bonus",{bonus:Number.isFinite(bonus)?bonus:0})).evaluate();
    const failed=save.total<outcome.dc;
    const backlash=await(new Roll(String(outcome.strain*(failed?2:1))+"d6")).evaluate();
    if(failed)await writeEnergy(actor,(old,pb)=>setBurnout(old,pb,true));
    resultHTML+='<p><b>Overload:</b> '+mode+' · Strain '+outcome.strain+
      ' · CON DC '+outcome.dc+' · Save <b>'+save.total+'</b> ('+(failed?'FAILED':'PASSED')+')</p>'+
      '<p>Backlash: <b>'+backlash.total+' Force damage</b> (ignore resistance/immunity; GM applies HP/Temp HP).</p>'+
      (failed?'<p><b>Burnout:</b> Creative Energy is unusable until after the next turn; GM clears Burnout.</p>':'');
  }
  await ChatMessage.create({
    speaker:ChatMessage.getSpeaker({actor}),
    content:'<div class="aam-chat"><b>Creative Affinity · '+escapeHTML(id)+'</b>'+
      '<p>'+escapeHTML(description)+'</p>'+resultHTML+
      '<small>Custom effects, saves and targets are adjudicated by the GM. Granted Affinity abilities remain free of Creative Energy.</small></div>'
  });
  return outcome;
}
