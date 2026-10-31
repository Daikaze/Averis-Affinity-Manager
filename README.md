## v0.3.3 — Native Foundry interface for V14 / 6.0.6

- **Native ApplicationV2** window frame, edge resizing and double-click minimization; compact application title.
- Replaced forced black-and-gold layout, fixed dark inputs and hardcoded colors with standard Foundry theme buttons, inputs, dropdowns, panels and font colors.
- Updated both standalone Affinity dashboard and core/Tidy character-sheet Affinity tab; consistent responsive layout in compact windows.
- **No changes to saved Actors, Affinity progress, Level 1–5 abilities, GM-only DC visibility, uses, world-time cooldowns, native Features or Activity creation.**
- No other modules' UI is modified. CSS remains scoped to `.aam-window`, `.aam-embedded` and dedicated sheet-tab hooks.
- Regression tests verify CSS isolation and native controls. Test actual UI interactions in a V14 world with other sheet modules.

## v0.3.2 — Foundry V14 / D&D 5e 6.0.6 compatibility

- **Supported environment:** Foundry V14 build 14.367+ (generation 14) with **D&D 5e 6.0.6**. The manifest and regression checks now target this system version.
- Checked against the upstream 6.0.6 character-sheet structure and native Activity model. The standard sheet keeps its Affinity tab, while Tidy integration continues through Tidy's public tab API (requires a Tidy build compatible with D&D 6.x).
- Fixed **Use / Share** so a cancelled native Activity does not record a completed use or decrement the Affinity counter.
- All 65 ability definitions, linked native Features and original SVG artwork, independent player progress, GM-only DCs, and the 3-day/7-day training clock remain unchanged.
- No Actor-flag migration is needed. Existing saved Affinities and manually deleted/suppressed Features remain intact. Back up the world before upgrading D&D5e.
- **Live-world smoke test recommended:** open a core and (if installed) Tidy character sheet, use an Affinity Activity, cancel an activity, complete training, and confirm GM-only data stays private.

## v0.3.1 — Unique Feature artwork for all 65 Affinity abilities

- Every newly unlocked Affinity ability at Levels 1–5 now receives its own **element-themed SVG icon** in **Character Sheet → Features**. There are 65 bundled images across 13 Affinities, including Blood; icons also show a small tier mark (I–V).
- Existing module-managed D&D Feats still using the old `icons/svg/aura.svg` placeholder receive **an image-only upgrade**, automatically when the GM opens that character's Affinity tab. The existing Items retain their IDs, activities, progression, uses and other properties.
- Images chosen manually by the GM are never overwritten. Features deleted manually are not recreated and other modules' Items are ignored.
- This works with the native D&D 5e 5.3.3 and Tidy character sheet integrations. All images are included in the release ZIP, so there are no external image dependencies.
- The module includes automated coverage for all 65 image assets, migration, idempotency, permissions, preserving manually changed images, and missing Feature suppression.

## v0.3.0 — Dedicated Character Sheet Affinity tab

- **Tidy 5e Sheet (13.10.x / dnd5e 5.3.3 / Foundry V14):** uses the official `tidy5e-sheet.ready` API and `registerCharacterTab` with a custom **Affinity** tab. It appears alongside Inventory, Features and Spellbook in the character sheet navigation.
- **Standard D&D 5e Character Sheet:** adds **Affinity** beside Features with a tab-scoped view; the other tabs, D&D data and standard components are not modified or overwritten.
- The Affinity tab has the full **Abilities**, **Training**, **History**, available Affinities, progression, Use/Share and the complete **GM Controls**, including Grant, Remove, Set Level, Roll/Record, cooldown and Restore Features.
- Each character sheet is tied to its **own Actor**: players cannot switch to another character using the Affinity tab. Only the GM sees numeric upgrade DCs or GM actions.
- **No more header three-dot Affinity Manager action** on character sheets. The original independent window is retained as an optional fallback through Alt+A or the module API.
- The embedded layout is responsive and scrolls internally so it does not require a very tall character sheet. Each sheet retains its tab and selected affinity while open.
- Prevents cross-tab clicks from triggering D&D 5e's native actions, duplicates of our tab, and stale async UI after rapid character updates.
- The Actor flags, progression, manual Feature removals, native D&D Activities and existing skill rules remain unchanged.

**Tidy user tip:** If you previously customized the visible Tidy tabs, open the sheet's **Configure Sheet / Tidy Sheet Settings → Tabs** and enable **Affinity** (new custom tabs may not automatically appear in a previously saved custom tab list). Reopen the sheet after installing this version.

## v0.2.1 — D&D 5e Activity ID compliance

Every generated D&D 5e 5.3.3 Activity and linked Active Effect now uses an explicitly verified 16-character Foundry document ID. This prevents invalid or silently discarded activities. Version v0.2.1 supersedes the v0.2.0 playtest package.

## v0.2.0 — Independent Affinities and native D&D 5e Activities

- **Remove Affinity** clears the Actor's known-Affinity flag, cooldown and usage history for that affinity. It deletes **only** the module-owned Features belonging to that Affinity. Another known Affinity is not created, removed or swapped in.
- **Use / Share** activates the selected Feature's native D&D Activity. It no longer triggers a global Feature sync and cannot recreate all learned Affinities as a side effect.
- A Feature manually deleted in Character Sheet is remembered as suppressed and is **never automatically resurrected** by rest, level changes, opening the window, or using a different ability. A deliberate GM **Restore Features** command can restore those missing Features.
- All 65 catalogued abilities have native D&D 5e 5.3.3 **Utility Activities**, including their action/bonus/reaction timing when specified. Where the ability has unambiguous immediate attack damage, it also has a proper Attack Activity; other explicitly described damage or healing gains separate optional Damage/Heal Activities.
- Conditional choices, saves with GM-only DC, delayed damage, area and timed side effects still require D&D's normal rolls and GM adjudication. Numbers for GM-only DC are never embedded into player-readable Item data. Activity activation itself runs the D&D system/Midi-QOL if available, but the module does not invent missing mechanics.
- Exact self AC bonuses on Ice Armor and Earth Sovereign have linked native **Active Effects**. Other multi-target/conditional effects are not applied without their prerequisite conditions or GM review.
- Older managed Features without Activities can be upgraded individually when used, or in a deliberate GM Restore Features pass.
- Item IDs/flags, Actor affinity progression and the original source rules stay stable. Long Rest usage remains managed in the Affinity Manager. Using an Item directly in the Character Sheet does not automatically decrement the module's separate use counter in this version.

## v0.1.4 — Native Features and reliable Remove Affinity

- On each unlocked Affinity Level (1–5), the GM automatically grants a **native D&D 5e Feat Item**, visible in **Character Sheet → Features**. The ability name and canonical rules are copied from the Affinity catalog. Numeric DCs are redacted from player-readable descriptions.
- Removing an Affinity from the GM panel now confirms explicitly, persists the removal and automatically removes the module-created Feats for that Affinity. It never deletes manually authored or third-party Feats, even if their names match.
- GM Level override (down or up) reconciles unlocked Features. Reopening the Manager as GM repairs missing older Features; **Sync Features** in the GM panel can rerun this process manually.
- Feature creation is idempotent: no duplicates when retried; failed embedded updates warn the GM and remain retryable without losing Affinity progress.
- These are **descriptive D&D Feat Items** rather than automated attack/spell activities; combat mechanics and tracked uses continue to run via the existing Affinity Manager and normal D&D workflows.

## v0.1.3 — Training clock / DialogV2 fixes

- Detect abnormally far-future cooldown timestamps (more than 45 game days from the present). A clock reset or mismatch will no longer freeze training for hundreds of thousands of days. The longest user-configurable cooldown is 30 days; a 45-day safeguard includes slack for minor clock adjustments.
- The next successful training check automatically repairs a stale timestamp, without removing already completed check successes. **GM-only Clear cooldown** is also available, preserving level, training check successes, and usage counters.
- Display training cooldown in normalized days and hours (never "24h" after partial hour rounding).
- Force an accessible dark background and light text inside all Affinity Manager confirmation/input dialogs independent of external light themes. Dialog buttons continue to use the host theme.

> **Repository migration (v0.1.1):** The canonical source, releases, and installation manifest are now maintained at [Daikaze/Averis-Affinity-Manager](https://github.com/Daikaze/Averis-Affinity-Manager). Module ID `averis-affinity-manager` is unchanged, so world/actor flags remain associated with the same module. If updating an install linked to the old manifest, use the new URL or reinstall the package after backing up your world.

# Averis Affinity Manager — v0.1.1

Original v0.1.1 playtest documentation for a Foundry V14 Affinity module (current support: **D&D 5e 6.0.6**). implementing Averis Affinity learning, mastery checks and source-specific abilities.

## Install from Manifest URL

Foundry Setup → Add-on Modules → Install Module → Manifest URL:

```
https://raw.githubusercontent.com/Daikaze/Averis-Affinity-Manager/main/module.json
```

Enable **Averis Affinity Manager** inside your world. Open a character sheet and choose the **Affinity** tab, or use **Alt+A** or a script macro:

```js
await game.modules.get("averis-affinity-manager").api.open();
```

## What the user-supplied rules specify

- The Level 1–5 upgrades require **all three successes**: Constitution, Arcana, Insight, in that order; DCs **10 / 13 / 15 / 17 / 20** (GM view only).
- Normal known Affinities: **maximum 3**. Special Affinities (e.g. Blood) do not use this slot cap.
- If learning an Affinity from **another creature**, that teaching creature must have **Level 5** mastery in that Affinity. To teach from a creature not tracked by this module, GM may mark it as a Level 5 teacher.
- An Innate GM grant is separate from learning from a creature. The GM explicitly selects the source; no player can add an Affinity themselves.
- The source document contains **12 complete standard Affinities and Special Blood**, for **65 individual abilities**. It ends with a label **Another Affinity** but supplies no abilities. **Thunder is shown as a disabled placeholder**, not invented content.
- Based on previous Averis world rules, retry is **3 world days after a failed check**, and **7 world days after a completed upgrade**. Both are configurable under Game Settings → Module Settings. If you want no downtime change them to 0.

## Usage

1. Choose a character in the left sidebar and an Affinity.
2. GM uses **Grant innate**, **Learn from teacher** (a qualified teacher), or **Grant special** for Blood. The affinity begins at Level 0.
3. GM uses **Roll next check** or **Record total**. All difficulty numbers are shown only in GM panels. The roll is GM-whispered; only the pass/fail and unlocked level are announced publicly.
4. Upgrade successes persist across attempts; failure triggers retry cooldown. When all 3 checks pass, the level increases automatically, unlocking the next canonical ability.
5. Players can read unlocked ability rules, **Use / Share** an ability and roll individual listed damage/healing dice. Items are NOT auto-applied to targets; the GM handles D&D 5e attack/save/effect resolution.
6. Uses limited per Long Rest are recorded on each world character Actor. After a standard D&D Long Rest, click **Reset Affinity Uses (Long Rest)**; this only clears Affinity usage, not spell slots or other resources.
7. GM can adjust level or remove an Affinity, with confirmation. No standard skill or character-level progression is overwritten.

## Security and limitations

- Only GMs can perform Affinity grants or training rolls; player socket requests **only open a GM approval panel**. A player never specifies DCs or sets Affinity levels via socket.
- **DC concealment is UI/chat-level, not cryptographic secrecy**. Foundry modules are downloaded to user computers; a technically knowledgeable player who reads source files can see fixed DCs. Genuine confidentiality would require a server-only component or manually configured secret GM-held DCs outside a downloadable module.
- D&D 5e sheet bonuses: quick GM rolls use the numerical Constitution ability modifier / skill totals available on the Actor. To account for conditional bonuses (Guidance, Advantage from external modules, custom dice, etc.), use **Record Total**, which accepts the actual D&D final roll result. Exact automatic integration of all third-party effects is intentionally not claimed.
- No automatic damage, save application, condition tracking, concentration or MIDI-QOL effects. Complex canonical abilities (e.g. Mind Rewrite, Time-sensitive multi-stage effects) require DM adjudication.
- The cooldown uses Foundry **world time** (`game.time.worldTime`), not real-world days. Advancing the in-game clock advances cooldown; no reliance on Simple Calendar.
- State is saved in Actor flags. Player-owned world Actors are supported; token-only unlinked NPCs are not intended recipients of persistent player Affinity progression.
- Long-rest resource limits are extracted only when explicitly stated in the supplied rule descriptions. Abilities without an explicit limit are not given invented charges. Special once-per-rest subeffects may need separate GM tracking.
- This build has Node regression tests and Foundry V14 API-targeted structure, but has **not been playtested in your actual Foundry world**. Back up your world before enabling.

## Built-in catalog

Fire, Earth, Wind, Water, Lightning, Psychic, Necrotic, Poison, Acid, Ice, Radiant, Force, and Special Blood. No description is replaced or balanced without DM input.