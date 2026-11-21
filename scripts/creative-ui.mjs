/** Plain HTML for the Creative Energy dashboard; only GM-approved improvised effects cost Energy. */
export function renderCreativeEnergy({energy,pb=2,hasAffinity=false,isGM=false,isNPC=false}={}){
  const e=energy;
  const badges=Array.from({length:e.max},(_,i)=>
    '<span class="aam-energy-pip '+(i<e.current?'filled':'')+'" aria-hidden="true"></span>').join('');
  const abilityWarning='<p class="aam-energy-help">Granted Affinity spells and Features NEVER spend Creative Energy. Their original limits still apply.</p>';
  const costRows=[
    ['1','Minor','Small noncombat effect or distraction'],
    ['2','Moderate','Brief restraint, push, or simple defense'],
    ['3','Powerful','Strong single-target or small area effect'],
    ['4','Very Powerful','Significant multi-target effect'],
    ['5','Extreme','Large extraordinary magic effect'],
    ['6','Legendary','Major temporary battlefield change']
  ].map(x=>'<div class="aam-energy-cost"><b>'+x[0]+'</b><span><strong>'+x[1]+'</strong><small>'+x[2]+'</small></span></div>').join('');
  let controls='';
  if(hasAffinity){
    controls='<div class="aam-energy-actions"><button type="button" data-action="creative-spend"><i class="fas fa-minus-circle"></i> Spend Energy</button>'+
      '<button type="button" data-action="creative-forced" '+(e.overloadUsed||e.burnout?'disabled':'')+'><i class="fas fa-bolt"></i> Forced Activation</button>'+
      '<button type="button" data-action="creative-empowered" '+(e.overloadUsed||e.burnout?'disabled':'')+'><i class="fas fa-fire"></i> Empowered Overload</button></div>';
  }else controls='<p class="aam-energy-help">No Affinity assigned. The GM must unlock an Affinity before creative use.</p>';
  const gmControls=isGM?'<div class="aam-energy-gm"><button type="button" data-action="energy-adjust">GM · Adjust Energy</button>'+
    '<button type="button" data-action="energy-short">GM · +1 Energy (Short Rest)</button>'+
    '<button type="button" data-action="energy-long">GM · Long Rest</button>'+
    (e.burnout?'<button type="button" data-action="energy-clear-burnout">GM · Clear Burnout</button>':'')+'</div>':'';
  return '<div class="aam-energy-page"><div class="aam-energy-heading"><h3>Creative Affinity Energy</h3>'+
    '<span class="aam-energy-count">'+e.current+' / '+e.max+'</span></div>'+
    '<div class="aam-energy-pips">'+badges+'</div>'+
    '<p class="aam-energy-help">Maximum = Proficiency Bonus (currently +'+pb+'). All learned Affinities share one pool.</p>'+
    abilityWarning+
    (e.overloadUsed?'<p class="aam-energy-warning">Overload already used this Long Rest.</p>':'')+
    (e.burnout?'<p class="aam-energy-warning">Affinity Burnout: no Creative Energy use until the GM clears it after your next turn.</p>':'')+
    controls+gmControls+
    '<div class="aam-energy-heading"><h3>DM Cost Guide</h3><small>GM decides whether an action is possible.</small></div>'+
    '<div class="aam-energy-costs">'+costRows+'</div>'+
    '<p class="aam-energy-help">Short Rest restores 1 Energy. Long Rest fully restores Energy and Overload. Forced Activation spends any remaining Energy and adds 1 Strain per missing point (max 3). Empowered Overload consumes normal cost plus 1 Strain. CON Save DC = 10 + 2 × Strain; success: 1d6 per Strain, failure: 2d6 per Strain and Burnout. Backlash HP adjustment is GM-adjudicated.</p></div>';
}
