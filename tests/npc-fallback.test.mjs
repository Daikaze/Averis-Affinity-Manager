import assert from "node:assert/strict";
import test from "node:test";
import {registerAffinitySheetTabs,AFFINITY_TAB_ID} from "../scripts/sheet-integration.mjs";

const npc={id:"npc1",documentName:"Actor",type:"npc",name:"NPC"};
const hero={id:"hero1",documentName:"Actor",type:"character",name:"Hero"};

function harness({withTidy=false,allowed=true,hasNav=true}={}){
  const handlers=new Map(),openCalls=[],mountCalls=[],tabCalls=[],headerCalls=[];
  const hooks={
    once(name,fn){handlers.set("once:"+name,fn);},
    on(name,fn){handlers.set(name,fn);}
  };
  const anchor={button:null,append(el){this.button=el;}};
  const root={
    classList:{contains(name){return withTidy&&name==="tidy5e-sheet";}},
    querySelector(sel){
      if(sel==="[data-aam-npc-open]")return anchor.button;
      if(sel==='nav.tabs[data-group="primary"]')return hasNav?anchor:null;
      if(sel==='nav.tabs')return hasNav?anchor:null;
      if(sel==='.window-header .window-controls')return anchor;
      if(sel==='.window-header')return anchor;
      if(sel==='.sheet-header')return anchor;
      if(sel===".tidy5e-sheet")return withTidy?root:null;
      return null;
    }
  };
  const tidy={
    models:{HtmlTab:class HtmlTab{constructor(p){Object.assign(this,p);}}},
    registerCharacterTab(tab){tabCalls.push(["character",tab]);},
    registerNpcTab(tab){tabCalls.push(["npc",tab]);},
    registerNpcHeaderControls(config){headerCalls.push(config);},
    isTidy5eSheet(){return withTidy;}
  };
  const integration=registerAffinitySheetTabs({
    hooks,getTidyApi:()=>withTidy?tidy:null,
    isCharacter:a=>a?.type==="character",
    isNpc:a=>a?.type==="npc",
    canView:a=>allowed&&a?.type!=="vehicle",
    openNpc:a=>openCalls.push(a),
    mount:arg=>mountCalls.push(arg)
  });
  const app={actor:npc,element:root};
  return {handlers,openCalls,mountCalls,tabCalls,headerCalls,anchor,root,tidy,app,integration};
}

function installDocument(){
  const old=globalThis.document;
  globalThis.document={createElement(){
    return {
      dataset:{},attributes:{},className:"",innerHTML:"",
      setAttribute(key,value){this.attributes[key]=value;},
      addEventListener(event,fn){this.listener=fn;},
      click(){this.listener?.({
        preventDefault(){},stopPropagation(){},stopImmediatePropagation(){}
      });}
    };
  }};
  return ()=>{globalThis.document=old;};
}

test("Tidy NPC: still receives a clickable Affinity launcher when custom tab list hides Affinity",()=>{
  const restore=installDocument();
  try{
    const h=harness({withTidy:true});
    h.handlers.get("once:tidy5e-sheet.ready")(h.tidy);
    assert.equal(h.tabCalls.find(([which])=>which==="npc")[1].tabId,AFFINITY_TAB_ID);
    assert.equal(h.headerCalls.length,1,"also register official Tidy NPC header fallback");
    h.handlers.get("renderActorSheetV2")(h.app);
    assert.ok(h.anchor.button,"launcher appears beside NPC tabs");
    assert.match(h.anchor.button.innerHTML,/Affinity/);
    assert.equal(h.anchor.button.dataset.aamNpcOpen,"1");
    h.anchor.button.click();
    assert.deepEqual(h.openCalls,[npc],"button opens this specific NPC");
    h.handlers.get("renderApplicationV2")(h.app);
    assert.equal(h.anchor.button.dataset.aamNpcOpen,"1","re-render does not remove launcher");
    assert.equal(h.headerCalls[0].controls[0].visible.call(h.app),true);
    h.headerCalls[0].controls[0].onClickAction.call(h.app);
    assert.deepEqual(h.openCalls,[npc,npc]);
  }finally{restore();}
});

test("NPC sheet without compatible tab structure gets a working header launcher",()=>{
  const restore=installDocument();
  try{
    const h=harness({hasNav:false,withTidy:false});
    h.handlers.get("renderApplicationV2")(h.app);
    assert.ok(h.anchor.button);
    h.anchor.button.click();
    assert.deepEqual(h.openCalls,[npc]);
  }finally{restore();}
});

test("GM-only NPC controls are absent for disallowed viewers and never added to PCs",()=>{
  const restore=installDocument();
  try{
    const h=harness({allowed:false,withTidy:true});
    h.handlers.get("renderActorSheetV2")(h.app);
    assert.equal(h.anchor.button,null);
    h.handlers.get("tidy5e-sheet.renderActorSheet")(h.app,h.root);
    assert.equal(h.anchor.button,null);
    const pc=harness({withTidy:true});
    pc.app.actor=hero;
    pc.handlers.get("renderActorSheetV2")(pc.app);
    assert.equal(pc.anchor.button,null);
  }finally{restore();}
});

test("Tidy NPC header registration is idempotent",()=>{
  const h=harness({withTidy:true});
  h.integration.installTidy(h.tidy);
  assert.equal(h.integration.installTidy(h.tidy),false);
  assert.ok(h.headerCalls.length<=1,"Tidy NPC header registration is not duplicated");
});
