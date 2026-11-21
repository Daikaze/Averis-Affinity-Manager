import assert from "node:assert/strict";
import test from "node:test";
import {registerAffinitySheetTabs,AFFINITY_TAB_ID} from "../scripts/sheet-integration.mjs";

const hooks=new Map(),mounts=[],events=[];
const hookApi={
  once(name,fn){hooks.set("once:"+name,fn);},
  on(name,fn){hooks.set(name,fn);}
};
const pc={id:"hero",documentName:"Actor",type:"character",name:"Hero"};
const npc={id:"goblin",documentName:"Actor",type:"npc",name:"Goblin Shaman"};
const blocked={id:"blocked",documentName:"Actor",type:"npc",name:"Hidden NPC"};
const tabs={};
class HtmlTab{constructor(props){Object.assign(this,props);}}
const tidy={
  models:{HtmlTab},
  registerCharacterTab(tab,opts){tabs.character={tab,opts};},
  registerNpcTab(tab,opts){tabs.npc={tab,opts};},
  isTidy5eSheet(app){return app?.isTidy===true;}
};
const integration=registerAffinitySheetTabs({
  hooks:hookApi,getTidyApi:()=>tidy,
  isCharacter:a=>a?.documentName==="Actor"&&a.type==="character",
  isNpc:a=>a?.documentName==="Actor"&&a.type==="npc",
  canView:a=>a.id!=="blocked",
  mount:({app,actor,host,prior})=>{
    mounts.push({app,actor,host});
    prior.refresh=()=>events.push("refresh:"+actor.id);
    prior.dispose=()=>events.push("dispose:"+actor.id);
  }
});

test("Tidy API registers Affinity tab on both character and NPC sheets once",()=>{
  assert.ok(hooks.has("once:tidy5e-sheet.ready"));
  hooks.get("once:tidy5e-sheet.ready")(tidy);
  for(const key of ["character","npc"]){
    assert.equal(tabs[key].tab.tabId,AFFINITY_TAB_ID);
    assert.equal(tabs[key].tab.title,"Affinity");
    assert.equal(tabs[key].opts.includeAsDefaultTab,true);
    assert.match(tabs[key].tab.html,/aam-inline-host/);
  }
  hooks.get("once:ready")();
  assert.equal(integration.installTidy(tidy),false);
  assert.equal(tabs.npc.tab.enabled({actor:npc}),true);
  assert.equal(tabs.npc.tab.enabled({actor:blocked}),false);
});

test("Tidy NPC and character sheets mount separate Actor views; denied NPCs do not mount",()=>{
  const host={},npcApp={actor:npc,isTidy:true},pcApp={actor:pc,isTidy:true};
  const contents={querySelector:()=>host};
  tabs.npc.tab.onRender({app:npcApp,tabContentsElement:contents});
  assert.equal(mounts.at(-1).actor,npc);
  tabs.character.tab.onRender({app:pcApp,tabContentsElement:contents});
  assert.equal(mounts.at(-1).actor,pc);
  const count=mounts.length;
  tabs.npc.tab.onRender({app:{actor:blocked,isTidy:true},tabContentsElement:contents});
  assert.equal(mounts.length,count);
  integration.refreshActor(npc);
  assert.ok(events.includes("refresh:goblin"));
  hooks.get("closeNPCActorSheet")(npcApp);
  assert.ok(events.includes("dispose:goblin"));
});

function makeCoreSheet(actor){
  let featureActive=true,link=null,wrapper=null;
  const feature={classList:{remove(name){if(name==="active")featureActive=false;}},after(x){link=x;}};
  const nav={
    dataset:{},listener:null,
    querySelector(sel){
      if(sel==="[data-aam-tab-link]")return link;
      if(sel==='[data-tab="features"]')return feature;
      return null;
    },
    querySelectorAll(sel){return sel==="[data-tab].active"&&featureActive?[feature]:[];},
    append(x){link=x;},
    addEventListener(type,fn,capture){this.listener=fn;assert.equal(type,"click");assert.equal(capture,true);}
  };
  const host={};
  const body={
    append(x){wrapper=x;},
    querySelector(sel){return sel==="[data-aam-tab-body]"?wrapper:null;}
  };
  const selected=new Set();
  const root={
    classList:{add(x){selected.add(x);},remove(x){selected.delete(x);}},
    querySelector(sel){
      if(sel==='nav.tabs[data-group="primary"]')return nav;
      if(sel.includes(".tab-body#tabs"))return body;
      return null;
    }
  };
  const app={actor,element:root,isTidy:false};
  return {app,nav,getLink:()=>link,getWrapper:()=>wrapper,selected,hasActiveFeature:()=>featureActive};
}

test("official character sheet still includes usable Affinity tab next to Features",()=>{
  const sheet=makeCoreSheet(pc),old=globalThis.document;
  globalThis.document={createElement:makeElement};
  try{
    hooks.get("renderActorSheetV2")(sheet.app);
    assert.ok(sheet.getLink());
    assert.match(sheet.getLink().innerHTML,/Affinity/);
    sheet.nav.listener(clickLink());
    assert.equal(sheet.getWrapper().hidden,false);
    assert.ok(sheet.selected.has("aam-core-selected"));
    assert.equal(mounts.at(-1).actor,pc);
    sheet.nav.listener({target:{closest:sel=>sel==='[data-tab]'?{}:null}});
    assert.equal(sheet.getWrapper().hidden,true);
  }finally{globalThis.document=old;}
});

test("official NPC sheet gets icon Affinity tab and mounts the correct NPC",()=>{
  const sheet=makeCoreSheet(npc),old=globalThis.document;
  globalThis.document={createElement:makeElement};
  try{
    assert.ok(hooks.has("renderNPCActorSheet"));
    hooks.get("renderNPCActorSheet")(sheet.app);
    assert.ok(sheet.getLink());
    assert.match(sheet.getLink().innerHTML,/fa-gem/);
    assert.doesNotMatch(sheet.getLink().innerHTML,/<span>Affinity/,"NPC tabs are icon-only");
    assert.equal(sheet.getWrapper().hidden,true);
    sheet.nav.listener(clickLink());
    assert.equal(sheet.getWrapper().hidden,false);
    assert.equal(mounts.at(-1).actor,npc);
    assert.ok(sheet.selected.has("aam-core-selected"));
    hooks.get("renderNPCActorSheet")(sheet.app);
    assert.equal(sheet.getWrapper().hidden,false);
    assert.equal(sheet.nav.dataset.aamDelegated,"1");
  }finally{globalThis.document=old;}
});

test("unauthorized NPC has no tab in core sheet",()=>{
  const sheet=makeCoreSheet(blocked),old=globalThis.document;
  globalThis.document={createElement:makeElement};
  try{
    hooks.get("renderNPCActorSheet")(sheet.app);
    assert.equal(sheet.getLink(),null);
  }finally{globalThis.document=old;}
});

function makeElement(tag){
  return {
    dataset:{},className:"",innerHTML:"",hidden:false,attributes:{},
    setAttribute(k,v){this.attributes[k]=v;},
    classList:{add(){},remove(){}},
    querySelector:sel=>sel==="[data-aam-inline-host]"?{}:null
  };
}
function clickLink(){
  return {
    target:{closest:sel=>sel==="[data-aam-tab-link]"?{}:null},
    preventDefault(){},stopPropagation(){},stopImmediatePropagation(){}
  };
}
