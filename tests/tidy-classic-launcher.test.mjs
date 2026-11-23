import test from "node:test";
import assert from "node:assert/strict";
import {registerAffinitySheetTabs,AFFINITY_TAB_ID} from "../scripts/sheet-integration.mjs";

const cls=(initial=[])=>{
  const values=new Set(initial);
  return {add:x=>values.add(x),remove:x=>values.delete(x),contains:x=>values.has(x)};
};
function setup(type, allowed=true, nativeAffinity=false){
  const callbacks=new Map(),mounts=[];
  const actor={id:"actor-"+type,documentName:"Actor",type,name:"Test "+type};
  const hooks={on(name,fn){callbacks.set(name,fn);},once(name,fn){callbacks.set("once:"+name,fn);}};
  const nativeFeature={dataset:{tabId:"features"},classList:cls()};
  const nav={
    dataset:{},children:[nativeFeature],handlers:{},
    querySelector(sel){
      if(sel==="[data-aam-tidy-tab]")return this.children.find(x=>x.dataset?.aamTidyTab);
      if(sel.includes('[data-tab-id="') && sel.includes(AFFINITY_TAB_ID))
        return this.children.find(x=>x.dataset?.tabId===AFFINITY_TAB_ID && !x.dataset?.aamTidyTab);
      return null;
    },
    querySelectorAll(sel){return sel==="[data-tab-id]"?this.children:[];},
    append(el){this.children.push(el);},
    addEventListener(name,cb){this.handlers[name]=cb;}
  };
  nativeFeature.after=el=>nav.children.splice(nav.children.indexOf(nativeFeature)+1,0,el);
  if(nativeAffinity)nav.children.push({dataset:{tabId:AFFINITY_TAB_ID}});
  const container={
    children:[],
    append(el){this.children.push(el);},
    querySelector(sel){
      if(sel==="[data-aam-tidy-panel]")return this.children.find(x=>x.dataset?.aamTidyPanel)??null;
      return null;
    }
  };
  const existingPanel={parentElement:container};
  container.children.push(existingPanel);
  const root={
    classList:cls(["tidy5e-sheet"]),
    querySelector(sel){
      if(sel.startsWith(".tidy-tabs"))return nav;
      if(sel==='[data-tidy-sheet-part="tab-content"]')return existingPanel;
      if(sel==='[data-tab-contents-for]')return existingPanel;
      if(sel.includes(".tidy5e-sheet"))return this;
      return null;
    }
  };
  const app={actor,element:{0:root}};
  const result=registerAffinitySheetTabs({
    hooks,getTidyApi:()=>null,mount:({actor,host})=>mounts.push({actor,host}),
    isCharacter:a=>a?.type==="character",isNpc:a=>a?.type==="npc",
    canView:()=>allowed,openNpc(){throw Error("must stay in the sheet");}
  });
  return {actor,app,callbacks,nav,root,container,mounts,result};
}
function mockDocument(){
  const previous=globalThis.document;
  globalThis.document={createElement(type){
    const el={
      tag:type,dataset:{},classList:cls(),attributes:{},
      setAttribute(k,v){this.attributes[k]=v;},
      querySelector(sel){return sel==="[data-aam-inline-host]"?{}:null;},
      append(){},
      addEventListener(){},
      after(){}
    };
    return el;
  }};
  return ()=>globalThis.document=previous;
}
function click(s,tab){
  const link=tab==="affinity"?s.nav.children.find(x=>x.dataset?.aamTidyTab):s.nav.children[0];
  const event={
    target:{closest(selector){
      if(selector==="[data-aam-tidy-tab]")return tab==="affinity"?link:null;
      if(selector==="[data-tab-id]")return link;
      return null;
    }},
    preventDefault(){},stopPropagation(){},stopImmediatePropagation(){}
  };
  s.nav.handlers.click(event);
}

for(const type of ["character","npc"]){
  test("Tidy Classic "+type+" shows Affinity after Features and mounts inline content",()=>{
    const restore=mockDocument();
    try{
      const s=setup(type);
      s.callbacks.get("renderActorSheet")(s.app,s.app.element);
      assert.equal(s.nav.children.length,2);
      const link=s.nav.children[1];
      assert.equal(link.dataset.tabId,AFFINITY_TAB_ID);
      assert.match(link.innerHTML,/Affinity/);
      assert.equal(s.container.children.length,2);
      const panel=s.container.children[1];
      assert.equal(panel.hidden,true);
      click(s,"affinity");
      assert.equal(panel.hidden,false);
      assert.equal(s.mounts.length,1);
      assert.equal(s.mounts[0].actor,s.actor);
      assert.equal(s.root.classList.contains("aam-tidy-selected"),true);
      click(s,"native");
      assert.equal(panel.hidden,true);
      assert.equal(s.root.classList.contains("aam-tidy-selected"),false);
      s.callbacks.get("renderActorSheet")(s.app,s.app.element);
      assert.equal(s.nav.children.length,2,"no duplicate tabs after rerender");
    }finally{restore();}
  });
}
test("Tidy skips duplicate fallback when the registered HtmlTab is already visible",()=>{
  const restore=mockDocument();
  try{
    const s=setup("character",true,true);
    s.callbacks.get("renderActorSheet")(s.app,s.app.element);
    assert.equal(s.nav.children.length,2);
    assert.equal(s.nav.children.filter(x=>x.dataset?.aamTidyTab).length,0);
    assert.equal(s.container.children.length,1);
  }finally{restore();}
});
test("Tidy tab never exposes hidden NPC actor data",()=>{
  const restore=mockDocument();
  try{
    const s=setup("npc",false);
    s.callbacks.get("renderActorSheet")(s.app,s.app.element);
    assert.equal(s.nav.children.length,1);
    assert.equal(s.container.children.length,1);
  }finally{restore();}
});
