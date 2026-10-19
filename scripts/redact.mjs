/**
 * Conceal source difficulty class numbers from non-GM UI, chat and the
 * native D&D 5e Features created by the module.
 * Preserve other numeric mechanics (damage dice, ranges, uses, etc.).
 */
export function redactDC(content){
 return String(content??'')
  // e.g. "**(14)**" after "Saving Throw", including markdown emphasis.
  .replace(/\b(Save|Saving Throw)\s*(?:\*{1,2})?\s*\(\s*(?:\*{1,2})?\s*\d{1,3}\s*(?:\*{1,2})?\s*\)\s*(?:\*{1,2})?/gi,'$1 (DC: GM only)')
  .replace(/\bDC\s*[—:\-()\s*]*\d{1,3}\b/gi,'DC: GM only')
  .replace(/\b(Save|Saving Throw)\s*[—:\-()\s*]+(?:DC\s*)?\d{1,3}\b/gi,'$1 (DC: GM only)');
}
