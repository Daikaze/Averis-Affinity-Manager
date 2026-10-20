import {AFFINITY_MAP} from './catalog.mjs';
import {MODULE_ID} from './engine.mjs';

export const AFFINITY_ICON_ROOT=`modules/${MODULE_ID}/assets/affinity-icons`;

/** Each canonical ability has its own bundled, Foundry-local SVG artwork. */
export function featureIconPath(id,level){
 const n=Number(level);
 if(!Object.hasOwn(AFFINITY_MAP,id)||AFFINITY_MAP[id].unavailable||!Number.isInteger(n)||n<1||n>5)
   throw Error('Unknown Affinity ability icon.');
 return `${AFFINITY_ICON_ROOT}/${id}-${n}.svg`;
}

/**
 * Only replace legacy default artwork. Never overwrite a GM's custom
 * image, a pasted portrait, or a custom icon from another module.
 */
export function isLegacyAffinityIcon(img){
 const str=String(img??'').trim();
 return !str||str==='icons/svg/aura.svg';
}
