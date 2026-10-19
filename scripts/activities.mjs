/**
 * Native D&D5e 5.3.3 Activities built from original Affinity descriptions.
 * All abilities get a usable Utility activity. Unambiguous instant attacks,
 * direct damage, and heals also receive dedicated system Activities.
 *
 * Saving DCs are private GM rules: no fixed DC is serialized into a player-
 * readable Activity or Actor Item. Conditional/timed effects are represented
 * as a native Activity with descriptive rules instead of incorrectly dealing
 * damage instantly or applying a condition before a save succeeds.
 */
export function activationFromDescription(desc=""){
 const m=String(desc).match(/(?:\*\*)?(?:Type:|Action Economy:)\s*(?:\*\*)?\s*(?:\*\*)?(Bonus Action|Reaction|Action|Passive)\b/i)
 ||String(desc).match(/(?:^|\n)\s*-\s*(?:\*\*)?(Bonus Action|Reaction|Action|Passive)(?:\*\*)?(?:\s|$)/i)
 ||String(desc).match(/(?:^|\n)\s*-\s*(?:\*\*)?Type:\s*(?:\*\*)?\s*(Bonus Action|Reaction|Action|Passive)\b/i);
 const t=m?.[1]?.toLowerCase()??"";
 return t==="bonus action"?"bonus":t==="reaction"?"reaction":t==="passive"?"":t==="action"?"action":"action";
}
const DAMAGE_TYPES=["fire","cold","lightning","thunder","acid","poison","necrotic","radiant","psychic","force","bludgeoning","piercing","slashing"];
export function damageParts(desc=""){
 const normalized=String(desc).replace(/\*\*/g,"");
 const out=[];
 const regexp=/\b(\d+)d(4|6|8|10|12|20)\b(?:\s*\+\s*(\d+|PB|Proficiency Bonus))?[^\n]{0,38}?\b(Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force|Bludgeoning|Piercing|Slashing)\s+Damage\b/gi;
 for(const m of normalized.matchAll(regexp)){
  const part={number:Number(m[1]),denomination:Number(m[2]),types:[m[4].toLowerCase()]};
  if(m[3])part.bonus=/^(pb|proficiency bonus)$/i.test(m[3])?"@prof":m[3];
  if(!out.some(x=>JSON.stringify(x)===JSON.stringify(part)))out.push(part);
 }
 return out;
}
const cleaned=s=>String(s).replace(/\*\*/g,"");
function saveInDescription(desc){
 return /\b(?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma|Str|Dex|Con|Int|Wis|Cha)\s+(?:Saving Throw|Save)\b/i.test(cleaned(desc));
}
function isImmediateAttack(desc){
 const t=cleaned(desc);
 return /\b(?:Ranged|Melee)\s+(?:(?:Weapon|Spell)\s+)?Attack\b/i.test(t)
  && !/\bor\s+Melee\s+(?:Weapon|Spell)\s+Attack\b/i.test(t);
}
export function makeActivityBundle(ability){
 const desc=String(ability.description??"");
 const activation=activationFromDescription(desc);
 const parts=damageParts(desc);
 const primary={_id:"affinityActivate",type:"utility",name:"Activate "+ability.title,
   activation:{type:activation,cost:1,override:true},
   description:{chatFlavor:"Resolve conditional effects, saving throws, and movement using the Affinity rules. GM adjudicates secret DCs."},
   consumption:{targets:[],spellSlot:false},
   roll:{prompt:false}
 };
 const actions={affinityActivate:primary};
 const safeAttack=isImmediateAttack(desc)&&parts.length===1&&!saveInDescription(desc);
 if(safeAttack){
  const m=cleaned(desc).match(/\b(Ranged|Melee)\s+(Weapon|Spell)\s+Attack\b/i);
  if(m){
   actions.affinityStrike={_id:"affinityStrike",type:"attack",name:"Attack and Damage",
     activation:{type:activation,cost:1,override:true},
     attack:{type:{value:m[1].toLowerCase(),classification:m[2].toLowerCase()}},
     damage:{includeBase:false,parts:[parts[0]]},
     consumption:{targets:[],spellSlot:false}
   };
  }
 }
 // Additional die rolls are explicitly optional; do not apply delayed damage
 // (e.g. marked targets, poison-over-time, and trigger reactions) immediately.
 if(!safeAttack&&parts.length===1){
   actions.affinityDamage={_id:"affinityDamage",type:"damage",name:"Roll Damage (GM adjudicates trigger)",
    activation:{type:"",cost:1,override:true},
    damage:{parts:[parts[0]]},
    consumption:{targets:[],spellSlot:false}
   };
 }
 // Healing is an optional choice and must not be forced when removing conditions.
 const h=cleaned(desc).match(/\b(?:Restore|Regain|Heals?|Healing)\b[^\n]{0,40}?\b(\d+)d(4|6|8|10|12)(?:\s*\+\s*(PB|\d+))?\s*(?:HP|Hit Points)?\b/i);
 if(h){
  actions.affinityHeal={_id:"affinityHeal",type:"heal",name:"Restore Hit Points (if chosen)",
    activation:{type:"",cost:1,override:true},
    healing:{number:Number(h[1]),denomination:Number(h[2]),types:["healing"],bonus:h[3]?.toLowerCase()==="pb"?"@prof":h[3]??""},
    consumption:{targets:[],spellSlot:false}
  };
 }
 return actions;
}
