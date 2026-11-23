import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const code = readFileSync(new URL("../scripts/main.js", import.meta.url), "utf8");
const begin = code.indexOf("const MIN_DND5E_VERSION=");
const end = code.indexOf("const esc=", begin);
assert.ok(begin >= 0 && end > begin, "D&D system version check exists");
const script = code.slice(begin, end) + "\nglobalThis.checkSupported = supportedDnd5e;";

test("Affinity Manager supports D&D 5e 5.3.3 and 6.0.6 through 6.1.1 on Foundry V14", () => {
  const sandbox = {game: {system: {id: "dnd5e", version: "6.1.1"}}};
  vm.runInNewContext(script, sandbox, {filename: "affinity-compatibility.js"});
  for (const version of ["5.3.3", "6.0.6", "6.1.0", "6.1.1"]) {
    sandbox.game.system.version = version;
    assert.equal(sandbox.checkSupported(), true, "expected " + version + " supported");
  }
  for (const version of ["5.3.2", "5.4.0", "6.0.5", "6.1.2", "6.2.0", "invalid"]) {
    sandbox.game.system.version = version;
    assert.equal(sandbox.checkSupported(), false, "expected " + version + " unsupported");
  }
  sandbox.game.system.id = "pf2e";
  sandbox.game.system.version = "6.1.1";
  assert.equal(sandbox.checkSupported(), false, "unrelated systems should not pass");
});
