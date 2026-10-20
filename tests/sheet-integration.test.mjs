import assert from 'node:assert/strict';
import test from 'node:test';
import {registerAffinitySheetTabs,AFFINITY_TAB_ID} from '../scripts/sheet-integration.mjs';

const hooks=new Map(),events=[],mounts=[];
const hookApi={
 once(name,fn){hooks.set(name,fn);},
 on(name,fn){hooks.set(name,fn);}
};
const actor={id:'hero',documentName:'Actor',type:'character',name:'Hero'};
let registered;
class HtmlTab {constructor(props){Object.assign(this,props);}}
const tidy={
 models:{HtmlTab},
 registerCharacterTab(tab,options){registered={tab,options};},
 isTidy5eSheet(app){return app?.isTidy===true;}
};
const integration=registerAffinitySheetTabs({
 hooks:hookApi,getTidyApi:()=>tidy,
 isCharacter:a=>a?.documentName==='Actor'&&a?.type==='character',
 canView:a=>a?.id==='hero',
 mount:({app,actor,host,prior})=>{
  mounts.push({app,actor,host});
  prior.refresh=()=>events.push('refresh');
  prior.dispose=()=>events.push('dispose');
 }
});

test('Tidy 5e character API creates one real Affinity tab with the correct id',()=>{
 assert.ok(hooks.has('tidy5e-sheet.ready'));
 hooks.get('tidy5e-sheet.ready')(tidy);
 assert.equal(registered.tab.tabId,AFFINITY_TAB_ID);
 assert.equal(registered.tab.title,'Affinity');
 assert.equal(registered.options.includeAsDefaultTab,true);
 assert.match(registered.tab.html,/aam-inline-host/);
 hooks.get('ready')();
 assert.equal(integration.installTidy(tidy),false,'registration is idempotent');
});
test('Tidy tab renders for its own character, never another character or an NPC',()=>{
 const app={actor,isTidy:true},host={};
 registered.tab.onRender({app,tabContentsElement:{querySelector:()=>host}});
 assert.equal(mounts.length,1);
 assert.equal(mounts[0].actor,actor);
 assert.equal(mounts[0].host,host);
 integration.refreshActor(actor);
 assert.deepEqual(events,['refresh']);
 assert.equal(registered.tab.enabled({actor}),true);
 assert.equal(registered.tab.enabled({actor:{...actor,id:'other'}}),false);
 assert.equal(registered.tab.enabled({}),true,'unknown context must not hide tab');
 registered.tab.onRender({app:{actor:{id:'npc',documentName:'Actor',type:'npc'}},tabContentsElement:{querySelector:()=>host}});
 assert.equal(mounts.length,1);
 hooks.get('closeActorSheetV2')(app);
 assert.ok(events.includes('dispose'));
});
test('standard V14 character sheet adds Affinity beside Features, preserves other tabs',()=>{
 let featureActive=true,coreLink=null,wrapper=null;
 const feature={
  classList:{remove(name){if(name==='active')featureActive=false;}},
  after(link){coreLink=link;}
 };
 const nav={
  dataset:{},listener:null,
  querySelector(sel){
   if(sel==='[data-aam-tab-link]')return coreLink;
   if(sel==='[data-tab="features"]')return feature;
   return null;
  },
  querySelectorAll(sel){return sel==='[data-tab].active'&&featureActive?[feature]:[];},
  append(link){coreLink=link;},
  addEventListener(type,fn,capture){this.listener=fn;assert.equal(capture,true);}
 };
 const host={};
 const body={
  append(x){wrapper=x;},
  querySelector(sel){return sel==='[data-aam-tab-body]'?wrapper:null;}
 };
 const selected=new Set();
 const root={
  classList:{add(c){selected.add(c);},remove(c){selected.delete(c);}},
  querySelector(sel){
   if(sel==='nav.tabs[data-group="primary"]')return nav;
   if(sel.includes('.tab-body#tabs'))return body;
   return null;
  }
 };
 const app={actor,element:root,isTidy:false};
 const oldDocument=globalThis.document;
 globalThis.document={createElement(tag){
  const el={
   dataset:{},className:'',innerHTML:'',hidden:false,
   attributes:{},
   setAttribute(k,v){this.attributes[k]=v;},
   classList:{add(){},remove(){}},
   querySelector(s){return s==='[data-aam-inline-host]'?host:null;}
  };
  if(tag==='a')el.after=()=>{};
  return el;
 }};
 try{
  hooks.get('renderActorSheetV2')(app);
  assert.ok(coreLink,'custom tab link exists');
  assert.equal(wrapper.hidden,true);
  const simulated={
   target:{closest:sel=>sel==='[data-aam-tab-link]'?coreLink:null},
   preventDefault(){},stopPropagation(){},stopImmediatePropagation(){}
  };
  nav.listener(simulated);
  assert.equal(wrapper.hidden,false);
  assert.ok(selected.has('aam-core-selected'));
  assert.equal(mounts.at(-1).actor,actor);
  assert.equal(featureActive,false);
  hooks.get('renderActorSheetV2')(app);
  assert.equal(wrapper.hidden,false);
  assert.equal(nav.dataset.aamDelegated,'1');
  nav.listener({target:{closest:sel=>sel==='[data-tab]'?feature:null}});
  assert.equal(wrapper.hidden,true);
  assert.ok(!selected.has('aam-core-selected'));
 }finally{globalThis.document=oldDocument;}
});
