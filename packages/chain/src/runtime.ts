import { Balance } from "@proto-kit/library";
import { Balances } from "./balances";
import { Lending } from "./lending";
import { ModulesConfig } from "@proto-kit/common";

export const modules = {
  Balances,
  Lending,
};

export const config: ModulesConfig<typeof modules> = {
  Balances: {
    totalSupply: Balance.from(10_000),
  },
  Lending: {},
};

export default {
  modules,
  config,
};
