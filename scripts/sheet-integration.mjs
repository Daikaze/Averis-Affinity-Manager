/**
 * Affinity sheet integration for Foundry V14 / D&D 5e 5.3.3 and 6.x plus Tidy 5e.
 *
 * Core characters and NPCs get a real in-sheet Affinity tab.
 * Tidy characters and NPCs use Tidy's tab registration API.
 * NPCs also get a visible direct-launch control: custom Tidy tab lists and
 * third-party NPC sheets must not make the Affinity Manager inaccessible.
 */
export const AFFINITY_TAB_ID="averis-affinity-manager-affinity";
const installed=new WeakMap();
const active=new Set();
let tidyCharacterRegistered=false;
let tidyNpcRegistered=false;
let tidyNpcHeaderRegistered=false;

export function registerAffinitySheetTabs({
  hooks=Hooks,
  getTidyApi=()=>game.modules?.get("tidy5e-sheet")?.api,
  mount,
  isCharacter=a=>a?.documentName==="Actor"&&a?.type==="character",
  isNpc=a=>a?.documentName==="Actor"&&a?.type==="npc",
  canView=()=>true,
  openNpc=()=>{}
}={}){
  if(typeof mount!=="function")throw Error("Affinity tab needs a mount callback.");
  const resolveActor=app=>app?.actor??app?.document;
  const isSupported=actor=>isCharacter(actor)||isNpc(actor);
  const resolveRoot=(app,element)=>{
    const root=app?.element;
    if(root?.querySelector)return root;
    if(root?.[0]?.querySelector)return root[0];
    if(element?.querySelector)return element;
    if(element?.[0]?.querySelector)return element[0];
    return null;
  };
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
    if(result&&typeof result.then==="function")
      void result.catch(e=>console.error("[Affinity Manager] Tab render error",e));
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

  // This NPC button works even if the sheet's available-tabs configuration
  // excludes the custom Affinity tab, or the sheet lacks native tabs.
  function ensureNpcLauncher(app,element){
    const actor=resolveActor(app);
    if(!isNpc(actor)||!canView(actor)||typeof openNpc!=="function")return false;
    const root=resolveRoot(app,element);
    if(!root?.querySelector)return false;
    if(root.querySelector('[data-aam-npc-open]'))return true;
    const anchor=root.querySelector('nav.tabs[data-group="primary"]')
      ??root.querySelector('nav.tabs')
      ??root.querySelector('.window-header .window-controls')
      ??root.querySelector('.window-header')
      ??root.querySelector('.sheet-header');
    if(!anchor?.append)return false;
    const button=document.createElement("button");
    button.type="button";
    button.dataset.aamNpcOpen="1";
    button.className="aam-npc-open item control";
    button.title="Open Affinity Manager for this NPC";
    button.setAttribute("aria-label","Affinity");
    button.innerHTML='<i class="fas fa-gem" aria-hidden="true"></i><span>Affinity</span>';
    button.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      try{void Promise.resolve(openNpc(actor)).catch(e=>console.error("[Affinity Manager] NPC panel error",e));}
      catch(e){console.error("[Affinity Manager] NPC panel error",e);}
    });
    anchor.append(button);
    return true;
  }

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
    // Tidy's supported header-controls API provides a second fallback in the
    // window controls, independent of a custom NPC's tab configuration.
    if(!tidyNpcHeaderRegistered&&typeof api.registerNpcHeaderControls==="function"){
      api.registerNpcHeaderControls({
        controls:[{
          icon:"fas fa-gem",
          label:"Affinity",
          visible(){
            const actor=this?.actor??this?.document;
            return isNpc(actor)&&canView(actor);
          },
          onClickAction(){
            const actor=this?.actor??this?.document;
            if(!isNpc(actor)||!canView(actor))return;
            return openNpc(actor);
          }
        }]
      });
      tidyNpcHeaderRegistered=true;
      registered=true;
    }
    return registered;
  };
  hooks.once("tidy5e-sheet.ready",installTidy);
  hooks.once("ready",()=>{installTidy(getTidyApi());});

  function ensureCoreTab(app,element){
    const actor=resolveActor(app);
    if(!isSupported(actor)||!canView(actor))return;
    const root=resolveRoot(app,element);
    if(!root?.querySelector)return;
    const tidy=getTidyApi();
    if(typeof tidy?.isTidy5eSheet==="function"){
      try{
        if(tidy.isTidy5eSheet(app)){
          if(isNpc(actor))ensureNpcLauncher(app,element);
          return;
        }
      }catch{}
    }
    if(root.classList?.contains?.("tidy5e-sheet")||root.querySelector(".tidy5e-sheet")){
      if(isNpc(actor))ensureNpcLauncher(app,element);
      return;
    }

    // Official D&D5e 5.3.3 and 6.x character and NPC sheets may use this tab structure; other sheets use the fallback launcher.
    const nav=root.querySelector('nav.tabs[data-group="primary"]');
    const body=root.querySelector('.tab-body#tabs, #tabs.tab-body');
    if(!nav||!body){
      if(isNpc(actor))ensureNpcLauncher(app,element);
      return;
    }
    const npc=isNpc(actor);
    let link=nav.querySelector("[data-aam-tab-link]");
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
  hooks.on("renderActorSheet",ensureCoreTab);
  hooks.on("renderApplicationV2",ensureCoreTab);
  hooks.on("tidy5e-sheet.renderActorSheet",(app,element)=>{
    const actor=resolveActor(app);
    if(isNpc(actor)&&canView(actor))ensureNpcLauncher(app,element);
  });

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
  return {installTidy,ensureCoreTab,ensureNpcLauncher,refreshActor,instances:installed};
}
