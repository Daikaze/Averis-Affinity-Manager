/**
 * Creative Affinity Energy is a GM-priced pool for improvisation only.
 * It does NOT consume or replace any prepared Affinity spell/Feature uses.
 * Kept in its own Actor flag so older progress saves are never rewritten.
 */
export const MAX_CREATIVE_COST = 6;
const int = (v, fallback=0) => Number.isSafeInteger(Number(v)) ? Number(v) : fallback;
const cap = (v,min,max) => Math.max(min,Math.min(max,int(v,min)));
const obj = x => x && typeof x==="object" && !Array.isArray(x) ? x : {};

export function proficiencyFromActor(actor){
  const direct=Number(actor?.system?.attributes?.prof);
  if(Number.isFinite(direct) && direct>=1 && direct<=12) return Math.floor(direct);
  const raw=actor?.system?.details?.cr?.value ?? actor?.system?.details?.cr ?? 0;
  const str=String(raw);
  const cr=str.includes("/") ? (Number(str.split("/")[0])/Number(str.split("/")[1])) : Number(str);
  if(actor?.type==="npc" && Number.isFinite(cr)) return cap(2+Math.max(0,Math.floor((cr-1)/4)),2,9);
  return 2;
}

export function energyState(raw,pb=2){
  const r=obj(raw);
  const override=Number.isInteger(Number(r.maxOverride))&&Number(r.maxOverride)>=1&&Number(r.maxOverride)<=12
    ? Number(r.maxOverride):null;
  const max=override ?? cap(pb,1,12);
  return {
    current:r.current===undefined||r.current===null ? max : cap(r.current,0,max),
    max,maxOverride:override,
    overloadUsed:r.overloadUsed===true,
    burnout:r.burnout===true
  };
}
export function energyData(s){
  return {current:s.current,maxOverride:s.maxOverride,overloadUsed:s.overloadUsed,burnout:s.burnout};
}
export function spendCreativeEnergy(raw,pb,cost,mode="normal"){
  const s=energyState(raw,pb),c=Number(cost);
  if(!Number.isInteger(c)||c<1||c>MAX_CREATIVE_COST)throw Error("GM must assign an Energy cost from 1 to 6.");
  if(!["normal","forced","empowered"].includes(mode))throw Error("Invalid Creative Energy mode.");
  if(s.burnout)throw Error("Affinity Burnout is active. Ask the GM to clear it after your next turn.");
  if(mode==="normal" && c>s.current)throw Error("Not enough Energy; ask the GM about Forced Activation.");
  if(mode==="empowered" && c>s.current)throw Error("Empowered Overload requires full normal Energy cost.");
  if(mode==="forced" && c<=s.current)throw Error("Forced Activation is only for missing Energy.");
  const strain=mode==="forced"?c-s.current:mode==="empowered"?1:0;
  if(strain>3)throw Error("Overload strain cannot exceed 3.");
  if(strain && s.overloadUsed)throw Error("Overload has already been used this Long Rest.");
  const updated={...s,current:Math.max(0,s.current-c),overloadUsed:s.overloadUsed||strain>0};
  return {state:energyData(updated),strain,dc:strain?10+2*strain:null,spent:Math.min(c,s.current)};
}
export function setBurnout(raw,pb,failed){
  const s=energyState(raw,pb);
  return energyData({...s,burnout:failed===true});
}
export function recoverEnergy(raw,pb,kind){
  const s=energyState(raw,pb);
  if(kind==="short")return energyData({...s,current:Math.min(s.max,s.current+1)});
  if(kind==="long")return energyData({...s,current:s.max,overloadUsed:false,burnout:false});
  throw Error("Invalid rest type.");
}
export function setEnergyCurrent(raw,pb,current){
  const s=energyState(raw,pb),n=Number(current);
  if(!Number.isInteger(n)||n<0||n>s.max)throw Error("Energy must be between 0 and the maximum.");
  return energyData({...s,current:n});
}
export function setEnergyMaximum(raw,pb,override){
  if(override!==null && (!Number.isInteger(Number(override))||Number(override)<1||Number(override)>12))
    throw Error("Maximum override must be 1–12 or automatic.");
  const s=energyState(raw,pb),newMax=override===null?cap(pb,1,12):Number(override);
  return energyData({...s,max:newMax,maxOverride:override,current:Math.min(s.current,newMax)});
}
