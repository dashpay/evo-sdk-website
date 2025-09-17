export class SystemFacade {
    constructor(sdk) { this.sdk = sdk; }
    async status() { const w = await this.sdk.getWasmSdkConnected(); return w.getStatus(); }
    async currentQuorumsInfo() { const w = await this.sdk.getWasmSdkConnected(); return w.getCurrentQuorumsInfo(); }
    async totalCreditsInPlatform() { const w = await this.sdk.getWasmSdkConnected(); return w.getTotalCreditsInPlatform(); }
    async totalCreditsInPlatformWithProof() { const w = await this.sdk.getWasmSdkConnected(); return w.getTotalCreditsInPlatformWithProofInfo(); }
    async prefundedSpecializedBalance(identityId) { const w = await this.sdk.getWasmSdkConnected(); return w.getPrefundedSpecializedBalance(identityId); }
    async prefundedSpecializedBalanceWithProof(identityId) { const w = await this.sdk.getWasmSdkConnected(); return w.getPrefundedSpecializedBalanceWithProofInfo(identityId); }
    async waitForStateTransitionResult(stateTransitionHash) { const w = await this.sdk.getWasmSdkConnected(); return w.waitForStateTransitionResult(stateTransitionHash); }
    async pathElements(path, keys) { const w = await this.sdk.getWasmSdkConnected(); return w.getPathElements(path, keys); }
    async pathElementsWithProof(path, keys) { const w = await this.sdk.getWasmSdkConnected(); return w.getPathElementsWithProofInfo(path, keys); }
}
