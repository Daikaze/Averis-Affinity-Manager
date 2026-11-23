import test from "node:test";
import assert from "node:assert/strict";
import {registerAffinitySheetTabs} from "../scripts/sheet-integration.mjs";

function setup(type, allowed=true) {
  const callbacks=new Map(), launches=[], added=[];
  const actor={id:"test-"+type, name:"Test "+type, documentName:"Actor", type};
  const header={append(el){added.push(el);}};
  const root={
    classList:{contains(k){return k==="tidy5e" || k==="tidy5e-sheet";}},
    querySelector(selector){
      if(selector==="[data-aam-sheet-open]")return added.find(el=>el.dataset.aamSheetOpen)??null;
      if(selector==="[data-aam-npc-open]")return added.find(el=>el.dataset.aamNpcOpen)??null;
      if(selector===".window-header .window-controls")return header;
      return null;
    }
  };
  const jqueryRoot={0:root,jquery:"3.7.1"};
  const app={actor,element:jqueryRoot};
  const hooks={
    on(event,cb){callbacks.set(event,cb);},
    once(event,cb){callbacks.set("once:"+event,cb);}
  };
  const integration=registerAffinitySheetTabs({
    hooks, getTidyApi:()=>null,
    mount:()=>{},
    isCharacter:doc=>doc.type==="character",
    isNpc:doc=>doc.type==="npc",
    canView:()=>allowed,
    openNpc:doc=>launches.push(doc),
    openCharacter:doc=>launches.push(doc)
  });
  return {actor,app,callbacks,launches,added,integration};
}
function mockDocument(){
  const original=globalThis.document;
  globalThis.document={createElement:tag=>{
    assert.equal(tag,"button");
    const events={};
    return {
      dataset:{},attributes:{},className:"",innerHTML:"",
      setAttribute(key,value){this.attributes[key]=value;},
      addEventListener(type,fn){events[type]=fn;},
      click(){events.click?.({preventDefault(){},stopPropagation(){},stopImmediatePropagation(){}});}
    };
  }};
  return ()=>globalThis.document=original;
}

for(const type of ["character","npc"]){
  test("Tidy Classic App V1 "+type+" always gets a visible Affinity button",()=>{
    const restore=mockDocument();
    try{
      const s=setup(type);
      s.callbacks.get("renderActorSheet")(s.app,s.app.element);
      assert.equal(s.added.length,1,"a button is attached to the classic window header");
      const button=s.added[0];
      assert.equal(button.dataset.aamSheetOpen,"1");
      assert.match(button.innerHTML,/Affinity/);
      assert.equal(button.type,"button");
      button.click();
      assert.deepEqual(s.launches,[s.actor],"opens manager for the current Actor");
      s.callbacks.get("renderActorSheet")(s.app,s.app.element);
      assert.equal(s.added.length,1,"rerenders cannot duplicate the button");
    } finally {restore();}
  });
}

test("Tidy Classic button is hidden for actors without view permission",()=>{
  const restore=mockDocument();
  try{
    const s=setup("npc",false);
    s.callbacks.get("renderActorSheet")(s.app,s.app.element);
    assert.equal(s.added.length,0);
  } finally {restore();}
});

test("Tidy Classic has a direct launcher even when no Tidy tab API is available",()=>{
  const restore=mockDocument();
  try{
    const s=setup("character");
    s.callbacks.get("tidy5e-sheet.renderActorSheet")(s.app,s.app.element);
    assert.equal(s.added.length,1);
    assert.equal(s.added[0].dataset.aamCharacterOpen,"1");
  } finally {restore();}
});
