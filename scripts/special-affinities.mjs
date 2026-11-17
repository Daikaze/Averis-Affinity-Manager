/** Nine new Special Affinities for Averis v0.4.0. */
export const NEW_SPECIAL_AFFINITIES=Object.freeze([
  {
    "id": "time",
    "name": "Time",
    "special": true,
    "color": "#70bce9",
    "icon": "fa-hourglass-half",
    "abilities": [
      {
        "level": 1,
        "title": "Temporal Instinct",
        "description": "**Type:** Reaction\n**Range:** Self\n\nWhen targeted by an attack, gain **+2 AC** against that attack. Declare before the attack roll is resolved.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": []
      },
      {
        "level": 2,
        "title": "Time Lag",
        "description": "**Type:** Action\n**Range:** 60 ft.\n**Saving Throw:** Wisdom\n\nOne visible creature on a failed save has halved Speed and cannot take Reactions until the start of your next turn.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": []
      },
      {
        "level": 3,
        "title": "Temporal Acceleration",
        "description": "**Type:** Bonus Action\n**Range:** 30 ft.\n**Duration:** 1 minute (Concentration)\n\nYourself or one willing creature gains +10 ft. Speed, Advantage on Dexterity Saves and attacks of opportunity against it have Disadvantage.\n**Uses:** 2 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 2
        },
        "dice": []
      },
      {
        "level": 4,
        "title": "Time Reversal",
        "description": "**Type:** Reaction\n**Range:** Self\n\nWhen you take damage, reduce the triggering damage by **3d8 + PB**. Optionally return to an unoccupied position you occupied since the start of your previous turn, within 10 ft. of your current position, without provoking Opportunity Attacks.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": [
          "3d8"
        ]
      },
      {
        "level": 5,
        "title": "Time Awakening: Frozen Epoch",
        "description": "**Type:** Action\n**Area:** 20-ft. radius centered on yourself\n**Saving Throw:** Wisdom\n\nFreeze time around enemies.\n- **Failed Save:** Incapacitated and Speed 0 until the start of your next turn.\n- **Successful Save:** Cannot take Reactions until the start of your next turn.\n- Damage ends the Incapacitated condition immediately.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": []
      }
    ]
  },
  {
    "id": "space",
    "name": "Space",
    "special": true,
    "color": "#9385e5",
    "icon": "fa-atom",
    "abilities": [
      {
        "level": 1,
        "title": "Rift Step",
        "description": "**Type:** Bonus Action\n**Range:** Self\n\nTeleport up to 10 ft. to an unoccupied space you can see.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": []
      },
      {
        "level": 2,
        "title": "Spatial Severance",
        "description": "**Type:** Action\n**Range:** 60 ft.\n**Attack:** Ranged Spell Attack\n**Damage:** 2d8 Force Damage\n\nLaunch a dimensional slash at one creature. Ignores Half Cover.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "2d8"
        ]
      },
      {
        "level": 3,
        "title": "Portal Guard",
        "description": "**Type:** Reaction\n**Range:** 30 ft.\n\nWhen you or an ally is damaged by an attack, reduce damage by **2d8 + PB**, then teleport that creature up to 10 ft. to a visible unoccupied space.\n**Uses:** 2 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 2
        },
        "dice": [
          "2d8"
        ]
      },
      {
        "level": 4,
        "title": "Fold Space",
        "description": "**Type:** Action\n**Range:** 30 ft.\n\nChoose up to three willing creatures within range. Teleport each up to 30 ft. to visible unoccupied destinations.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": []
      },
      {
        "level": 5,
        "title": "Space Awakening: Spatial Collapse",
        "description": "**Type:** Action\n**Range:** 90 ft. (20-ft. radius)\n**Saving Throw:** Dexterity\n**Damage:** 8d6 Force Damage\n\nCollapse space into a vortex.\n- **Failed Save:** Full damage; pulled up to 15 ft. toward center.\n- **Successful Save:** Half damage; no forced movement.\n- Pull ends at nearest safe unoccupied position.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": [
          "8d6"
        ]
      }
    ]
  },
  {
    "id": "gravity",
    "name": "Gravity",
    "special": true,
    "color": "#7585c6",
    "icon": "fa-meteor",
    "abilities": [
      {
        "level": 1,
        "title": "Gravitational Pull",
        "description": "**Type:** Action\n**Range:** 30 ft.\n**Saving Throw:** Strength\n**Damage:** 1d6 Force Damage\n\nOn a failed save, pull a target up to 10 ft. toward you, dealing the listed damage.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "1d6"
        ]
      },
      {
        "level": 2,
        "title": "Gravity Well",
        "description": "**Type:** Action\n**Range:** 60 ft. (10-ft. radius)\n**Saving Throw:** Strength\n**Damage:** 2d6 Force Damage\n\n- **Failed Save:** Full damage and knocked Prone.\n- **Successful Save:** Half damage; not knocked Prone.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "2d6"
        ]
      },
      {
        "level": 3,
        "title": "Gravitational Anchor",
        "description": "**Type:** Reaction\n**Range:** 30 ft.\n\nWhen you or an ally would take Bludgeoning, Piercing or Slashing damage, grant Resistance to that damage instance, preventing forced movement and Prone caused by the same effect.\n**Uses:** 2 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 2
        },
        "dice": []
      },
      {
        "level": 4,
        "title": "Heavy Domain",
        "description": "**Type:** Action\n**Range:** 60 ft. (15-ft. radius)\n**Duration:** 1 minute (Concentration)\n**Saving Throw:** Strength\n\nCreate stationary Difficult Terrain for enemies. An enemy entering the area for the first time on a turn or starting its turn there makes a Strength Save; on failure Speed becomes 0 until the start of its next turn.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": []
      },
      {
        "level": 5,
        "title": "Gravity Awakening: Singularity",
        "description": "**Type:** Action\n**Range:** 90 ft. (20-ft. radius)\n**Saving Throw:** Constitution\n**Damage:** 7d6 Force Damage\n\n- **Failed Save:** Full damage, pulled up to 15 ft. toward the center and Restrained until the end of your next turn.\n- **Successful Save:** Half damage and no additional effects.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": [
          "7d6"
        ]
      }
    ]
  },
  {
    "id": "soul",
    "name": "Soul",
    "special": true,
    "color": "#f4c9bd",
    "icon": "fa-ghost",
    "abilities": [
      {
        "level": 1,
        "title": "Soul Sight",
        "description": "**Type:** Bonus Action\n**Range:** 30 ft.\n**Duration:** 1 minute\n\nDetect living creatures and Undead in range, even if Invisible. Cannot detect creatures behind Total Cover or identify their appearance.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": []
      },
      {
        "level": 2,
        "title": "Spirit Strike",
        "description": "**Type:** On Hit (No Action)\n**Range:** Weapon or Spell Attack\n**Damage:** +2d6 Radiant or Necrotic Damage\n\nWhen you hit with an attack, add the listed damage; choose Radiant or Necrotic each time.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "2d6"
        ]
      },
      {
        "level": 3,
        "title": "Soul Tether",
        "description": "**Type:** Bonus Action\n**Range:** 30 ft.\n**Duration:** 1 minute (Concentration)\n\nBind your soul to a willing ally. As a Reaction when that ally takes damage, reduce it by **1d8 + PB**.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": [
          "1d8"
        ]
      },
      {
        "level": 4,
        "title": "Astral Passage",
        "description": "**Type:** Bonus Action\n**Range:** Self\n**Duration:** Until the end of your next turn\n\nGain Resistance to nonmagical Bludgeoning, Piercing and Slashing damage. Move through occupied creature spaces as Difficult Terrain, but not through walls or objects.\n**Uses:** 2 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 2
        },
        "dice": []
      },
      {
        "level": 5,
        "title": "Soul Awakening: Spirit Chorus",
        "description": "**Type:** Action\n**Range:** 30 ft.\n**Healing:** 3d8 + PB Hit Points per target\n\nChoose up to PB willing creatures within range. Each regains **3d8 + PB Hit Points**. End either Charmed or Frightened on each target.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": [
          "3d8"
        ]
      }
    ]
  },
  {
    "id": "dream",
    "name": "Dream",
    "special": true,
    "color": "#b79ae3",
    "icon": "fa-moon",
    "abilities": [
      {
        "level": 1,
        "title": "Dream Whisper",
        "description": "**Type:** Action\n**Range:** 60 ft.\n**Saving Throw:** Wisdom\n\nOne creature failing its save has Disadvantage on its next Attack Roll and cannot make Opportunity Attacks until the start of your next turn.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": []
      },
      {
        "level": 2,
        "title": "Phantom Reflection",
        "description": "**Type:** Reaction\n**Range:** Self\n\nWhen hit by an attack, summon a duplicate. The attacker rerolls the attack and uses the lower result. Activate before rolling damage.\n**Uses:** 2 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 2
        },
        "dice": []
      },
      {
        "level": 3,
        "title": "Nightmare Bloom",
        "description": "**Type:** Action\n**Range:** 60 ft. (10-ft. radius)\n**Saving Throw:** Wisdom\n**Damage:** 3d6 Psychic Damage\n\n- **Failed Save:** Full damage and Frightened of you until the end of your next turn.\n- **Successful Save:** Half damage and no Frightened condition.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "3d6"
        ]
      },
      {
        "level": 4,
        "title": "Lucid Escape",
        "description": "**Type:** Bonus Action\n**Range:** Self\n**Duration:** Until the start of your next turn\n\nTeleport 15 ft. to a visible unoccupied space and become Invisible until the start of your next turn. Ends early if you attack or cast a spell.\n**Uses:** 2 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 2
        },
        "dice": []
      },
      {
        "level": 5,
        "title": "Dream Awakening: Sovereign Nightmare",
        "description": "**Type:** Action\n**Range:** 60 ft. (20-ft. radius)\n**Saving Throw:** Wisdom\n**Damage:** 6d6 Psychic Damage\n\n- **Failed Save:** Full damage and Unconscious until end of your next turn.\n- **Successful Save:** Half damage; stays conscious.\n- Damage or an ally spending an Action awakens the target. Creatures immune to magical sleep cannot be rendered Unconscious by this effect.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": [
          "6d6"
        ]
      }
    ]
  },
  {
    "id": "void",
    "name": "Void",
    "special": true,
    "color": "#82909d",
    "icon": "fa-circle-notch",
    "abilities": [
      {
        "level": 1,
        "title": "Void Perception",
        "description": "**Type:** Bonus Action\n**Range:** 30 ft.\n**Duration:** 1 minute\n\nDetect active magical effects and dimensional disturbances, without automatically identifying them.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": []
      },
      {
        "level": 2,
        "title": "Null Ward",
        "description": "**Type:** Reaction\n**Range:** Self\n\nWhen damaged by a spell or magical effect, reduce that damage by **1d10 + PB**.\n**Uses:** 2 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 2
        },
        "dice": [
          "1d10"
        ]
      },
      {
        "level": 3,
        "title": "Unmaking Touch",
        "description": "**Type:** Action\n**Range:** 30 ft.\n**Attack:** Ranged Spell Attack\n**Damage:** 3d6 Force Damage\n\nOn a hit, the target cannot regain Hit Points until the start of your next turn.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "3d6"
        ]
      },
      {
        "level": 4,
        "title": "Null Sphere",
        "description": "**Type:** Action\n**Range:** 30 ft. (10-ft. radius)\n**Duration:** 1 minute (Concentration)\n\nCreate a stationary defensive field. Allies inside have Advantage on Saving Throws against spells; Spell Attack Rolls against creatures inside have Disadvantage.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": []
      },
      {
        "level": 5,
        "title": "Void Awakening: Oblivion Gate",
        "description": "**Type:** Action\n**Range:** 90 ft. (20-ft. radius)\n**Saving Throw:** Constitution\n**Damage:** 8d6 Force Damage\n\n- **Failed Save:** Full damage and unable to cast spells until start of your next turn.\n- **Successful Save:** Half damage and may still cast spells.\n- Does not end active spells.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": [
          "8d6"
        ]
      }
    ]
  },
  {
    "id": "chaos",
    "name": "Chaos",
    "special": true,
    "color": "#e78bba",
    "icon": "fa-dice-d20",
    "abilities": [
      {
        "level": 1,
        "title": "Wild Spark",
        "description": "**Type:** Action\n**Range:** 60 ft.\n**Attack:** Ranged Spell Attack\n**Damage:** 1d10 (random type)\n\nRoll 1d4 for damage type: 1 Fire, 2 Cold, 3 Lightning, 4 Psychic.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "1d10",
          "1d4"
        ]
      },
      {
        "level": 2,
        "title": "Unstable Step",
        "description": "**Type:** Bonus Action\n**Range:** Self\n\nTeleport 15 ft. to a visible unoccupied space; roll 1d4 for bonus: 1 +2 AC until next turn, 2 +10 ft. Speed this turn, 3 next hit this turn deals +1d6 Force Damage, 4 gain PB + 2 Temporary Hit Points.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "1d4",
          "1d6"
        ]
      },
      {
        "level": 3,
        "title": "Discord Burst",
        "description": "**Type:** Action\n**Area:** 30-ft. cone\n**Saving Throw:** Dexterity\n**Damage:** 3d6 (random type)\n\nRoll 1d4 for damage type as Wild Spark.\n- **Failed Save:** Full damage, pushed 10 ft.\n- **Successful Save:** Half damage; no push.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "3d6",
          "1d4"
        ]
      },
      {
        "level": 4,
        "title": "Chaos Reflection",
        "description": "**Type:** Reaction\n**Range:** Self\n\nWhen hit, roll 1d4: 1 Resistance to triggering damage, 2 attacker takes 3d6 Force Damage, 3 teleport up to 15 ft. after damage, 4 gain 2d8 Temporary Hit Points before damage.\n**Uses:** 2 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 2
        },
        "dice": [
          "1d4",
          "3d6",
          "2d8"
        ]
      },
      {
        "level": 5,
        "title": "Chaos Awakening: Cataclysm Roulette",
        "description": "**Type:** Action\n**Range:** 90 ft. (20-ft. radius)\n**Saving Throw:** Dexterity\n**Damage:** 8d6 (random type)\n\nDamage type from 1d4 as Wild Spark. Failed Save: full damage and roll 1d4 for additional effect: 1 Prone, 2 Blinded until start next turn, 3 pushed 15 ft., 4 no Reactions until next turn. Successful Save: half damage, no additional effect.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": [
          "8d6",
          "1d4"
        ]
      }
    ]
  },
  {
    "id": "fate",
    "name": "Fate",
    "special": true,
    "color": "#e6b767",
    "icon": "fa-wand-magic-sparkles",
    "abilities": [
      {
        "level": 1,
        "title": "Omen Sight",
        "description": "**Type:** Bonus Action\n**Range:** 30 ft.\n**Duration:** 1 minute\n\nYou or one willing ally can add 1d4 to one Attack Roll, Ability Check, or Saving Throw before the effect expires. Decide before the outcome is determined.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "1d4"
        ]
      },
      {
        "level": 2,
        "title": "Fortunate Shift",
        "description": "**Type:** Reaction\n**Range:** 30 ft.\n\nWhen an ally fails an Attack Roll, Ability Check, or Saving Throw, add 1d6 to that failed roll, potentially turning failure into success.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "1d6"
        ]
      },
      {
        "level": 3,
        "title": "Marked Destiny",
        "description": "**Type:** Bonus Action\n**Range:** 60 ft.\n**Duration:** 1 minute (Concentration)\n\nMark one creature. The first time each round you or an ally hits it with an attack, it takes an additional 1d6 Psychic Damage.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": [
          "1d6"
        ]
      },
      {
        "level": 4,
        "title": "Thread of Survival",
        "description": "**Type:** Reaction\n**Range:** 30 ft.\n\nWhen you or an ally would drop to 0 Hit Points, but not be killed outright, the target instead drops to 1 Hit Point. Cannot prevent effects explicitly causing instant death.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": []
      },
      {
        "level": 5,
        "title": "Fate Awakening: Rewrite the Inevitable",
        "description": "**Type:** Reaction\n**Range:** 60 ft.\n\nWhen a visible creature makes an Attack Roll, Saving Throw or Ability Check, replace the number on its d20 with 20 or 1. Decide after rolling but before declaring success or failure. This is not a natural 20/1 for critical effects and cannot bypass Legendary Resistance.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": []
      }
    ]
  },
  {
    "id": "metal",
    "name": "Metal",
    "special": true,
    "color": "#9daab9",
    "icon": "fa-shield-halved",
    "abilities": [
      {
        "level": 1,
        "title": "Metallic Guard",
        "description": "**Type:** Bonus Action\n**Range:** Self\n**Duration:** 1 minute\n\nGain +1 AC from magically reinforced metal.\n**Uses:** 2 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 2
        },
        "dice": []
      },
      {
        "level": 2,
        "title": "Iron Lash",
        "description": "**Type:** Action\n**Range:** 30 ft.\n**Attack:** Ranged Spell Attack\n**Damage:** 2d6 Slashing Damage\n\nStrike with a metallic whip. On a hit, the creature cannot take Reactions until the start of your next turn.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": [
          "2d6"
        ]
      },
      {
        "level": 3,
        "title": "Magnetic Dominion",
        "description": "**Type:** Action\n**Range:** 30 ft.\n**Saving Throw:** Strength\n\nChoose up to two visible creatures. On a failed save, pull the target 10 ft. toward you or force it to drop one held metal weapon in an unoccupied space within 5 ft. of it.\n**Uses:** PB / Long Rest",
        "uses": {
          "kind": "proficiency"
        },
        "dice": []
      },
      {
        "level": 4,
        "title": "Living Armor",
        "description": "**Type:** Bonus Action\n**Range:** Self\n**Duration:** 1 minute (Concentration)\n\nGain +2 AC and Resistance to nonmagical Slashing and Piercing damage. Works while wearing armor.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": []
      },
      {
        "level": 5,
        "title": "Metal Awakening: Thousand Blade Tempest",
        "description": "**Type:** Action\n**Area:** 30-ft. cone\n**Saving Throw:** Dexterity\n**Damage:** 8d6 magical Slashing Damage\n\n- **Failed Save:** Full damage; Speed halved until the end of your next turn.\n- **Successful Save:** Half damage without the speed reduction.\n**Uses:** 1 / Long Rest",
        "uses": {
          "kind": "fixed",
          "value": 1
        },
        "dice": [
          "8d6"
        ]
      }
    ]
  }
]);
