"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const ton_core_1 = require("ton-core");
const StableJetton_1 = require("../wrappers/StableJetton");
const blueprint_1 = require("@ton-community/blueprint");
async function run(provider) {
    const stableJetton = provider.open(StableJetton_1.StableJetton.createFromConfig({}, await (0, blueprint_1.compile)('StableJetton')));
    await stableJetton.sendDeploy(provider.sender(), (0, ton_core_1.toNano)('0.05'));
    await provider.waitForDeploy(stableJetton.address);
    // run methods on `stableJetton`
}
exports.run = run;
