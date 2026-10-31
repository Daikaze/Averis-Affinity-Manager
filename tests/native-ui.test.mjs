import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const css=readFileSync(new URL("../styles/main.css",import.meta.url),"utf8");
const source=readFileSync(new URL("../scripts/main.js",import.meta.url),"utf8");
const manifest=JSON.parse(readFileSync(new URL("../module.json",import.meta.url),"utf8"));

test("native V14 Affinity manager defaults and correct system target",()=>{
  assert.equal(manifest.version,"0.3.3");
  assert.equal(manifest.compatibility.verified,"14");
  assert.equal(manifest.relationships.systems[0].compatibility.verified,"6.0.6");
  assert.ok(source.includes("frame:true,minimizable:true,resizable:true"));
  assert.ok(source.includes("window:{title:'Averis Affinity Manager'"));
  assert.ok(source.includes('aria-label="Affinity sections"'));
  assert.ok(source.includes("Affinity Manager v0.3.3 targets"));
});
test("native CSS uses Foundry theme variables and scoped selectors",()=>{
  assert.ok(css.includes(".aam-window .window-content"));
  assert.ok(css.includes(".aam-embedded"));
  assert.ok(css.includes("var(--color-text-primary"));
  assert.ok(css.includes("var(--color-bg-option"));
  assert.ok(css.includes("var(--color-border-light-primary"));
  assert.ok(css.includes("@container affinity-window"));
  assert.ok(!css.includes("color-scheme:dark"));
  assert.ok(!css.includes("color-scheme: dark"));
  assert.ok(!css.includes("background:#0d121d"));
  assert.ok(!css.includes("background:#111b2a"));
  assert.ok(!css.includes("font-family:Inter"));
  assert.ok(!css.includes(".window-app button"));
});
test("core and Tidy Affinity tab routing and GM-only progression are preserved",()=>{
  const integration=readFileSync(new URL("../scripts/sheet-integration.mjs",import.meta.url),"utf8");
  assert.ok(integration.includes("registerCharacterTab"));
  assert.ok(integration.includes("renderActorSheetV2"));
  assert.ok(integration.includes("AFFINITY_TAB_ID"));
  assert.ok(source.includes("const gmControls=gm&&actor"));
  assert.ok(source.includes("const playerCta=!gm&&actor"));
  assert.ok(source.includes("DC_BY_LEVEL[lv]"));
  assert.ok(source.includes("this.embedded"));
  assert.ok(source.includes("registerAffinitySheetTabs"));
  assert.ok(source.includes("syncActorFeatures"));
});
