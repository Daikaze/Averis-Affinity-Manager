/**
 * In-sheet Affinity tab integration for character and NPC Actors.
 * Supports Tidy 5e's public character/NPC tab APIs and official D&D5e V14
 * sheet navigation without patching D&D5e sheet prototypes.
 *
 * NPC tabs are GM-only by default; callers provide the permission policy.
 */
export const AFFINITY_TAB_ID="averis-affinity-manager-affinity";
const installed=new WeakMap();
const active=new Set();
let tidyCharacterRegistered=false;
let tidyNpcRegistered=false;

export function registerAffinitySheetTabs({
  hooks=Hooks,
  getTidyApi=()=>game.modules?.get("tidy5e-sheet")?.api,
  mount,
  isCharacter=a=>a?.documentName==="Actor"&&a?.type==="character",
  isNpc=a=>a?.documentName==="Actor"&&a?.type==="npc",
  canView=()=>true
}={}){
  if(typeof mount!=="function")throw Error("Affinity tab needs a mount callback.");
  const resolveActor=app=>app?.actor??app?.document;
  const isSupported=actor=>isCharacter(actor)||isNpc(actor);
  const mountIn=(app,host)=>{
    const actor=resolveActor(app);
    if(!host||!isSupported(actor)||!canView(actor))return;
    let existing=installed.get(app);
    if(!existing||existing.actorId!==actor.id){
      existing?.dispose?.();
      existing={actorId:actor.id,dispose:null,refresh:null};
      installed.set(app,existing);
    }
    const result=mount({app,actor,host,prior:existing});
    if(result&&typeof result.then==="function")void result.catch(e=>console.error("[Affinity Manager] Tab render error",e));
    active.add(app);
    return existing;
  };

  const makeTidyTab=api=>new api.models.HtmlTab({
    tabId:AFFINITY_TAB_ID,
    title:"Affinity",
    iconClass:"fa-solid fa-gem",
    html:'<div class="aam-window aam-embedded aam-tidy-host" data-aam-inline-host></div>',
    enabled:context=>{
      const actor=context?.actor??context?.document??context?.sheet?.actor;
      return actor?isSupported(actor)&&canView(actor):true;
    },
    onRender:params=>{
      const host=params?.tabContentsElement?.querySelector?.("[data-aam-inline-host]")
           ??(params?.tabContentsElement?.matches?.("[data-aam-inline-host]")?params.tabContentsElement:null);
      mountIn(params?.app,host);
    }
  });

  const installTidy=api=>{
    if(!api?.models?.HtmlTab)return false;
    let registered=false;
    if(!tidyCharacterRegistered&&typeof api.registerCharacterTab==="function"){
      api.registerCharacterTab(makeTidyTab(api),{includeAsDefaultTab:true});
      tidyCharacterRegistered=true;
      registered=true;
    }
    if(!tidyNpcRegistered&&typeof api.registerNpcTab==="function"){
      api.registerNpcTab(makeTidyTab(api),{includeAsDefaultTab:true});
      tidyNpcRegistered=true;
      registered=true;
    }
    return registered;
  };
  hooks.once("tidy5e-sheet.ready",installTidy);
  hooks.once("ready",()=>{installTidy(getTidyApi());});

  function ensureCoreTab(app){
    const actor=resolveActor(app);
    if(!isSupported(actor)||!canView(actor))return;
    const tidy=getTidyApi();
    if(typeof tidy?.isTidy5eSheet==="function"){
      try{if(tidy.isTidy5eSheet(app))return;}catch{}
    }
    // Official D&D5e v6.0.6: both Character and NPC sheets use nav.tabs
    // with data-group="primary", and a .tab-body#tabs container.
    // NPC sheet uses vertical/right-side icon tabs.
    const root=app?.element;
    if(!root?.querySelector)return;
    const nav=root.querySelector('nav.tabs[data-group="primary"]');
    const body=root.querySelector('.tab-body#tabs, #tabs.tab-body');
    if(!nav||!body)return;
    const npc=isNpc(actor);
    let link=nav.querySelector('[data-aam-tab-link]');
    if(!link){
      link=document.createElement("a");
      link.className="item control aam-core-link";
      link.dataset.aamTabLink="1";
      link.setAttribute("role","tab");
      link.setAttribute("aria-label","Affinity");
      link.title="Affinity";
      link.innerHTML=npc
        ?'<i class="fas fa-gem" aria-hidden="true"></i>'
        :'<i class="fas fa-gem" aria-hidden="true"></i><span>Affinity</span>';
      const ref=nav.querySelector('[data-tab="features"]');
      if(ref)ref.after(link);else nav.append(link);
    }
    let wrapper=body.querySelector("[data-aam-tab-body]");
    if(!wrapper){
      wrapper=document.createElement("section");
      wrapper.className="aam-core-body";
      wrapper.dataset.aamTabBody="1";
      wrapper.innerHTML='<div class="aam-window aam-embedded aam-core-host" data-aam-inline-host></div>';
      body.append(wrapper);
    }
    const select=()=>{
      app._aamCoreSelected=true;
      root.classList.add("aam-core-selected");
      link.classList.add("active");
      link.setAttribute("aria-selected","true");
      wrapper.hidden=false;
      for(const other of nav.querySelectorAll('[data-tab].active'))other.classList.remove("active");
      mountIn(app,wrapper.querySelector("[data-aam-inline-host]"));
    };
    const deselect=()=>{
      app._aamCoreSelected=false;
      root.classList.remove("aam-core-selected");
      link.classList.remove("active");
      link.setAttribute("aria-selected","false");
      wrapper.hidden=true;
    };
    if(!nav.dataset.aamDelegated){
      // Capture before D&D5e's own tab handling, without changing its code.
      nav.addEventListener("click",e=>{
        if(e.target.closest("[data-aam-tab-link]")){
          e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
          select();
        }else if(e.target.closest("[data-tab]"))deselect();
      },true);
      nav.dataset.aamDelegated="1";
    }
    if(app._aamCoreSelected)select();
    else deselect();
  }
  hooks.on("renderCharacterActorSheet",ensureCoreTab);
  hooks.on("renderNPCActorSheet",ensureCoreTab);
  hooks.on("renderActorSheetV2",ensureCoreTab);

  const onClose=app=>{
    installed.get(app)?.dispose?.();
    installed.delete(app);
    active.delete(app);
  };
  hooks.on("closeCharacterActorSheet",onClose);
  hooks.on("closeNPCActorSheet",onClose);
  hooks.on("closeActorSheetV2",onClose);

  const refreshActor=actor=>{
    for(const app of active){
      if(installed.get(app)?.actorId!==actor.id)continue;
      const view=installed.get(app);
      if(typeof view?.refresh==="function")
        void Promise.resolve(view.refresh()).catch(e=>console.error("[Affinity Manager] Tab refresh error",e));
    }
  };
  return {installTidy,ensureCoreTab,refreshActor,instances:installed};
}
