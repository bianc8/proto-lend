import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey, Provable } from "o1js";
import { Balances } from "../src/balances";
import { Lending } from "../src/lending";
import { log } from "@proto-kit/common";
import { Balance, BalancesKey, TokenId, UInt64 } from "@proto-kit/library";

log.setLevel("ERROR");

describe("lending", () => {
  beforeAll(() => {});

  it("should demonstrate how lending work", async () => {
    const appChain = TestingAppChain.fromRuntime({
      Balances,
      Lending,
    });

    appChain.configurePartial({
      Runtime: {
        Balances: {
          totalSupply: UInt64.from(10000),
        },
        Lending: {},
      },
    });

    await appChain.start();

    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const tokenId = TokenId.from(0);

    appChain.setSigner(alicePrivateKey);

    const balances = appChain.runtime.resolve("Balances");
    const lending = appChain.runtime.resolve("Lending");

    const tx1 = await appChain.transaction(alice, () => {
      balances.addBalance(tokenId, alice, UInt64.from(1000));
    });

    await tx1.sign();
    await tx1.send();

    const block = await appChain.produceBlock();
    Provable.log("block", block);

    const key = new BalancesKey({ tokenId, address: alice });
    const balance = await appChain.query.runtime.Balances.balances.get(key);

    expect(block?.transactions[0].status.toBoolean()).toBe(true);
    expect(balance?.toString()).toBe("1000");

    // // lending tx
    // const tx2 = await appChain.transaction(alice, () => {
    //   lending.lend(UInt64.from(1), tokenId);
    // });

    // await tx2.sign();
    // await tx2.send();

    // const block2 = await appChain.produceBlock();
    // Provable.log("block", block);

    // const balance2 = await appChain.query.runtime.Lending.positions.get(alice);

    // expect(block2?.transactions[0].status.toBoolean()).toBe(true);
    // expect(balance2?.lend.toString()).toBe("1");
  }, 1_000_000);
});
