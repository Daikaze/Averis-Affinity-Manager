import assert from 'node:assert/strict';
import test from 'node:test';

const hooks=new Map(),hotkeys=new Map(),errors=[],warnings=[];
let rendered=0,failRender=false;
class MockApplicationV2 {
 constructor(){this.rendered=false;this.position={};}
 async render(options){
  assert.equal(options.force,true);
  if(failRender)throw Error('Mock dashboard render failure');
  this.rendered=true;rendered++;return this;
 }
 setPosition(pos){this.position=pos;}
 bringToFront(){}
}
globalThis.window={innerWidth:1440,innerHeight:900};
globalThis.ResizeObserver=undefined;
globalThis.foundry={applications:{api:{ApplicationV2:MockApplicationV2,DialogV2:{}}}};
globalThis.ui={notifications:{
 warn(message){warnings.push(String(message));},
 error(message){errors.push(String(message));},info(){}
}};
globalThis.Hooks={
 once(name,fn){hooks.set('once:'+name,fn);},
 on(name,fn){hooks.set(name,fn);}
};
const actor={
 id:'hero123',uuid:'Actor.hero123',type:'character',documentName:'Actor',name:'Averis Hero',
 testUserPermission(){return true;},getFlag(){return undefined;}
};
globalThis.game={
 user:{id:'gm',isGM:true},
 users:{activeGM:{id:'gm',active:true}},
 actors:{contents:[actor],get:id=>id===actor.id?actor:null},
 system:{id:'dnd5e'},
 modules:new Map([['averis-affinity-manager',{}]]),
 settings:{register(){}},
 keybindings:{register(module,name,options){hotkeys.set(name,options);}},
 socket:{on(){}},time:{worldTime:0}
};
await import('../scripts/main.js');
hooks.get('once:init')();
const api=game.modules.get('averis-affinity-manager').api;

test('Character Sheet tab replaces the old three-dot button',()=>{
 assert.equal(hooks.has('getHeaderControlsApplicationV2'),false);
 assert.ok(hooks.has('once:tidy5e-sheet.ready'));
 assert.ok(hooks.has('renderActorSheetV2'));
});
test('direct API opener remains available for macros or legacy worlds',async()=>{
 assert.equal(await api.open({actor}),true);
 assert.equal(rendered,1);
 assert.deepEqual(errors,[]);
});
test('Alt+A optional legacy hotkey still opens the manager',async()=>{
 assert.ok(hotkeys.has('open'));
 assert.equal(hotkeys.get('open').onDown(),true);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(rendered,2);
});
test('render errors produce a visible notice and a retry can succeed',async()=>{
 failRender=true;
 assert.equal(hotkeys.get('open').onDown(),true);
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(errors.at(-1),/Mock dashboard render failure/);
 failRender=false;
 assert.equal(await api.open({actor}),true);
 assert.equal(rendered,3);
});
test('opening without accessible actors does not crash',async()=>{
 game.actors.contents=[];
 assert.equal(await api.open({actor}),false);
 assert.match(warnings.at(-1),/No accessible world character Actors/);
});
