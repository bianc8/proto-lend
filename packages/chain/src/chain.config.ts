import { LocalhostAppChain } from "@proto-kit/cli";
import runtime from "./runtime";
// import { VanillaProtocolModules } from "@proto-kit/library";

const appChain = LocalhostAppChain.fromRuntime(runtime.modules);

appChain.configure({
  ...appChain.config,
  Runtime: runtime.config,
  // Protocol: VanillaProtocolModules.with({ TransactionFee: TransactionInterestModule }),
});

// TODO: remove temporary `as any` once `error TS2742` is resolved
export default appChain as any;
