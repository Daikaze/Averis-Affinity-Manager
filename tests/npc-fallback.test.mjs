import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {registerAffinitySheetTabs,AFFINITY_TAB_ID} from "../scripts/sheet-integration.mjs";

test("Tidy Character and NPC native custom tabs are available with no header controls",()=>{
  const callbacks=new Map(),tabs=[];
  const api={
    models:{HtmlTab:class HtmlTab{constructor(p){Object.assign(this,p);}}},
    registerCharacterTab(tab,options){tabs.push({kind:"character",tab,options});},
    registerNpcTab(tab,options){tabs.push({kind:"npc",tab,options});},
    registerCharacterHeaderControls(){throw Error("No Affinity header buttons requested");},
    registerNpcHeaderControls(){throw Error("No Affinity header buttons requested");}
  };
  const hooks={on(name,fn){callbacks.set(name,fn);},once(name,fn){callbacks.set("once:"+name,fn);}};
  const instance=registerAffinitySheetTabs({
    hooks,getTidyApi:()=>api,mount:()=>{},
    isCharacter:a=>a?.type==="character",
    isNpc:a=>a?.type==="npc"
  });
  callbacks.get("once:tidy5e-sheet.ready")(api);
  assert.equal(tabs.length,2);
  assert.deepEqual(tabs.map(t=>t.kind),["character","npc"]);
  for(const t of tabs){
    assert.equal(t.tab.tabId,AFFINITY_TAB_ID);
    assert.equal(t.options.includeAsDefaultTab,true);
    assert.match(t.tab.html,/aam-inline-host/);
  }
  assert.equal(instance.installTidy(api),false,"registered only once");
});
test("Tidy fallback deliberately targets tab strip, never window header",()=>{
  const source=readFileSync(new URL("../scripts/sheet-integration.mjs",import.meta.url),"utf8");
  assert.match(source,/\.tidy-tabs/);
  assert.match(source,/data-aam-tidy-tab/);
  assert.doesNotMatch(source,/registerNpcHeaderControls|registerCharacterHeaderControls|aam-sheet-open/);
});
