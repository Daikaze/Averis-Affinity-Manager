import {AFFINITY_MAP} from './catalog.mjs';
import {MODULE_ID,normalizeState} from './engine.mjs';
import {redactDC} from './redact.mjs';

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
      description:{value:featureHTML(affinity,ability)}
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

export function planFeatureSync(rawProgress,items=[]){
  const state=normalizeState(rawProgress);
  const desired=new Set();
  for(const [id,p] of Object.entries(state.known)){
    const affinity=AFFINITY_MAP[id];
    if(!affinity||affinity.unavailable)continue;
    for(let level=1;level<=p.level;level++)if(affinity.abilities.some(a=>a.level===level))desired.add(`${id}:${level}`);
  }
  const present=new Set(),deleteIds=[];
  for(const item of items??[]){
    const key=getOwnedFeatureIdentity(item);
    if(!key)continue;
    if(!item.id)continue; // Do not delete unsaved or malformed documents.
    if(!desired.has(key)||present.has(key))deleteIds.push(item.id);
    else present.add(key);
  }
  const creates=[];
  for(const key of desired){
    if(present.has(key))continue;
    const [id,levelStr]=key.split(':');
    creates.push(createFeatureData(id,Number(levelStr)));
  }
  return {creates,deleteIds,expectedCount:desired.size};
}

/**
 * Idempotent reconciliation. This intentionally never changes other feat Items,
 * does not modify D&D item activities or grant effects, and never removes
 * manually authored features merely because they have a similar name.
 */
export async function syncActorFeatures(actor,progress){
  if(!actor||typeof actor.createEmbeddedDocuments!=='function'||typeof actor.deleteEmbeddedDocuments!=='function')throw Error('Character Actor does not support embedded Item updates.');
  const existing=actor.items?.contents??[];
  const {creates,deleteIds,expectedCount}=planFeatureSync(progress,existing);
  // Delete first so a partially interrupted operation can be safely retried.
  if(deleteIds.length)await actor.deleteEmbeddedDocuments('Item',deleteIds);
  if(creates.length)await actor.createEmbeddedDocuments('Item',creates);
  return {created:creates.length,deleted:deleteIds.length,expectedCount};
}
