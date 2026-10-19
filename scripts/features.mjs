import {AFFINITY_MAP} from './catalog.mjs';
import {MODULE_ID,normalizeState} from './engine.mjs';
import {redactDC} from './redact.mjs';
import {makeActivityBundle} from './activities.mjs';

export const FEATURE_FLAG='managedFeature';
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function featureHTML(affinity,ability){
  // The original descriptions are kept intact in the source catalog. Character
  // features never contain a numeric DC, which must remain GM-only in the UI.
  const redacted=redactDC(ability.description??'');
  const paragraphs=redacted.split(/\n+/).map(line=>{
    const bullet=/^\s*-\s*/.test(line);
    const plain=line.replace(/^\s*-\s*/,'');
    if(!plain.trim()||plain.trim()==='---')return '';
    const formatted=escapeHTML(plain).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
    return `<p>${bullet?'&#8226; ':''}${formatted}</p>`;
  }).join('');
  return `<div class="averis-affinity-feature"><h3>${escapeHTML(affinity.name)} Affinity · Level ${ability.level}</h3>${paragraphs}<p><em>Granted by Averis Affinity Manager. Track uses and training in the module; GM adjudicates combat effects.</em></p></div>`;
}

export function createFeatureData(id,level) {
  const affinity=AFFINITY_MAP[id];
  const ability=affinity?.abilities?.find(v=>v.level===level);
  if(!affinity||affinity.unavailable||!ability)throw Error('Unknown Affinity or ability level.');
  return {
    name:`${affinity.name} Affinity — ${ability.title}`,
    type:'feat',
    img:'icons/svg/aura.svg',
    system:{
      description:{value:featureHTML(affinity,ability)},
      activities:makeActivityBundle(ability)
    },
    flags:{
      [MODULE_ID]:{
        [FEATURE_FLAG]:true,
        affinityId:id,
        abilityLevel:level,
        key:`${id}:${level}`
      }
    }
  };
}

export function getOwnedFeatureIdentity(item) {
  const meta=item?.flags?.[MODULE_ID];
  if(meta?.[FEATURE_FLAG]!==true)return null;
  const id=meta.affinityId,level=Number(meta.abilityLevel);
  if(!AFFINITY_MAP[id]||!Number.isInteger(level)||level<1||level>5)return null;
  if(meta.key!==`${id}:${level}`)return null;
  return `${id}:${level}`;
}


/**
 * Only synchronizes the named Affinity (when provided); manual deletions
 * are not resurrected by unrelated actions. GM can explicitly restore.
 */
export function planFeatureSync(rawProgress,items=[],{affinityId=null,restore=false}={}){
 const state=normalizeState(rawProgress);
 if(affinityId&&!AFFINITY_MAP[affinityId])throw Error('Invalid Affinity filter.');
 const desired=new Set(),suppressed=new Set(state.suppressedFeatures??[]);
 for(const [id,p] of Object.entries(state.known)){
   if(affinityId&&id!==affinityId)continue;
   const aff=AFFINITY_MAP[id];if(!aff||aff.unavailable)continue;
   for(let level=1;level<=p.level;level++){
     if(!aff.abilities.some(a=>a.level===level))continue;
     const key=id+':'+level;
     if(restore||!suppressed.has(key))desired.add(key);
   }
 }
 const present=new Set(),deleteIds=[];
 for(const item of items??[]){
   const key=getOwnedFeatureIdentity(item);
   if(!key||!item.id)continue;
   if(affinityId&&!key.startsWith(affinityId+':'))continue;
   if(!desired.has(key)||present.has(key))deleteIds.push(item.id);
   else present.add(key);
 }
 const creates=[];
 for(const key of desired){
   if(present.has(key))continue;
   const [id,level]=key.split(':');
   creates.push(createFeatureData(id,Number(level)));
 }
 return {creates,deleteIds,expectedCount:desired.size};
}
/** Tagged deletes are deliberately excluded from the manual delete hook. */
export async function syncActorFeatures(actor,progress,options={}){
 if(!actor||typeof actor.createEmbeddedDocuments!=='function'||typeof actor.deleteEmbeddedDocuments!=='function')
   throw Error('Character Actor does not support embedded Item updates.');
 const plan=planFeatureSync(progress,actor.items?.contents??[],options);
 const upgrades=[];
 const deleted=new Set(plan.deleteIds);
 for(const item of actor.items?.contents??[]){
  const key=getOwnedFeatureIdentity(item);
  if(!key||deleted.has(item.id))continue;
  if(options.affinityId&&!key.startsWith(options.affinityId+':'))continue;
  if(typeof item.system?.activities?.get==='function' && item.system.activities.get('affinityActivate'))continue;
  if(item.system?.activities?.affinityActivate)continue;
  const [id,level]=key.split(':');
  const original=createFeatureData(id,Number(level));
  const existing=item.system?.activities;
  const raw=existing?.toObject?.()??(existing&&typeof existing==='object'&&!Array.isArray(existing)?existing:{});
  upgrades.push({_id:item.id,'system.activities':{...raw,...original.system.activities}});
 }
 if(plan.deleteIds.length)await actor.deleteEmbeddedDocuments('Item',plan.deleteIds,{averisAffinityManagedSync:true});
 if(upgrades.length){
  if(typeof actor.updateEmbeddedDocuments!=='function')throw Error('Actor cannot upgrade existing Activity data.');
  await actor.updateEmbeddedDocuments('Item',upgrades,{averisAffinityManagedSync:true});
 }
 if(plan.creates.length)await actor.createEmbeddedDocuments('Item',plan.creates,{averisAffinityManagedSync:true});
 return {created:plan.creates.length,deleted:plan.deleteIds.length,expectedCount:plan.expectedCount,upgraded:upgrades.length};
}
