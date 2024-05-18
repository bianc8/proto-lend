import { ClientAppChain } from "@proto-kit/sdk";
import runtime from "./runtime";
import { Position } from "./lending";

const appChain = ClientAppChain.fromRuntime(runtime.modules);

appChain.configurePartial({
  Runtime: runtime.config,
});

export const client = appChain;

export { Position };
