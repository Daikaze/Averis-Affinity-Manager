import assert from 'node:assert/strict';
import test from 'node:test';

const hooks = new Map();
const hotkeys = new Map();
const errors = [];
const warnings = [];
let rendered = 0;
let failRender = false;

class MockApplicationV2 {
  constructor(){ this.rendered = false; this.position = {}; }
  async render(options) {
    assert.equal(options.force, true);
    if (failRender) throw new Error('Mock dashboard render failure');
    this.rendered = true;
    rendered++;
    return this;
  }
  setPosition(pos){this.position = pos;}
  bringToFront(){}
}
globalThis.window = {innerWidth:1440, innerHeight:900};
globalThis.ResizeObserver = undefined;
globalThis.foundry = {applications:{api:{ApplicationV2:MockApplicationV2,DialogV2:{}}}};
globalThis.ui = {notifications:{
  warn(message){warnings.push(String(message));},
  error(message){errors.push(String(message));},
  info(){}
}};
globalThis.Hooks = {
  once(name,fn){hooks.set('once:'+name,fn);},
  on(name,fn){hooks.set(name,fn);}
};
const actor = {
  id:'hero123', uuid:'Actor.hero123', type:'character', documentName:'Actor', name:'Averis Hero',
  testUserPermission(){return true;},
  getFlag(){return undefined;}
};
globalThis.game = {
  user:{id:'gm',isGM:true},
  users:{activeGM:{id:'gm',active:true}},
  actors:{contents:[actor],get:id=>id===actor.id?actor:null},
  system:{id:'dnd5e'},
  modules:new Map([['averis-affinity-manager',{}]]),
  settings:{register(){}},
  keybindings:{register(module,name,options){hotkeys.set(name,options);}},
  socket:{on(){}},
  time:{worldTime:0}
};
await import('../scripts/main.js');
hooks.get('once:init')();

test('V14 sheet menu entry has string action and working onClick',async()=>{
  const controls=[];
  hooks.get('getHeaderControlsApplicationV2')({actor},controls);
  assert.equal(controls.length,1);
  assert.equal(controls[0].action,'averisAffinityOpen');
  assert.equal(typeof controls[0].onClick,'function');
  const result=await controls[0].onClick();
  assert.equal(result,true);
  assert.equal(rendered,1,'the dashboard should be rendered when sheet menu entry is clicked');
  assert.deepEqual(errors,[]);
});

test('header controls avoid duplicate entry and do not leak to non-character sheets',()=>{
  const controls=[];
  const hook=hooks.get('getHeaderControlsApplicationV2');
  hook({actor},controls);
  hook({actor},controls);
  assert.equal(controls.length,1);
  const invalid=[];
  hook({actor:{...actor,type:'npc'}},invalid);
  assert.equal(invalid.length,0);
});

test('the Alt+A keyboard shortcut also opens the dashboard',async()=>{
  assert.ok(hotkeys.has('open'));
  assert.equal(hotkeys.get('open').onDown(),true);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(rendered,2);
});

test('render errors are reported, do not create unhandled promise rejection, and can be retried',async()=>{
  const controls=[];
  hooks.get('getHeaderControlsApplicationV2')({actor},controls);
  failRender=true;
  assert.equal(await controls[0].onClick(),false);
  assert.match(errors.at(-1),/Mock dashboard render failure/);
  failRender=false;
  assert.equal(await controls[0].onClick(),true);
  assert.equal(rendered,3);
});

test('missing accessible actors are reported instead of throwing',async()=>{
  game.actors.contents=[];
  const controls=[];
  hooks.get('getHeaderControlsApplicationV2')({actor},controls);
  assert.equal(await controls[0].onClick(),false);
  assert.match(warnings.at(-1),/No accessible world character Actors/);
});
