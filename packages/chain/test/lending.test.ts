import "reflect-metadata"; //fix typescript error
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
    appChain.setSigner(alicePrivateKey);

    const tokenIdToLend = TokenId.from(0);
    const tokenIdToBorrow = TokenId.from(1);

    const keyLend = new BalancesKey({ tokenId: tokenIdToLend, address: alice });
    const keyBorrow = new BalancesKey({
      tokenId: tokenIdToBorrow,
      address: alice,
    });

    const balances = appChain.runtime.resolve("Balances");
    const lending = appChain.runtime.resolve("Lending");

    // 1. add initial balance to alice
    const initialBalance = UInt64.from(1000);
    const tx1 = await appChain.transaction(alice, () => {
      balances.addBalance(tokenIdToLend, alice, initialBalance);
    });

    await tx1.sign();
    await tx1.send();

    const block = await appChain.produceBlock();
    const balance = await appChain.query.runtime.Balances.balances.get(keyLend);

    expect(block?.transactions[0].status.toBoolean()).toBe(true);
    expect(balance?.toString()).toBe(initialBalance?.toString());

    // 2. test lending tx
    const amountLended = UInt64.from(100);
    const tx2 = await appChain.transaction(alice, () => {
      lending.lend(amountLended, tokenIdToLend);
    });

    await tx2.sign();
    await tx2.send();

    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);

    const alicePositionLending =
      await appChain.query.runtime.Lending.positions.get(alice);
    expect(alicePositionLending?.lend.toString()).toBe(amountLended.toString());

    // expect aliceLentBalance = oldBalance - amountLent
    const aliceLentBalance =
      await appChain.query.runtime.Balances.balances.get(keyLend);
    expect(aliceLentBalance?.toString()).toBe(
      Balance.from(balance!).sub(Balance.from(amountLended)).toString()
    );

    // 3. borrow tx
    const amountBorrowed = UInt64.from(2);
    const tx3 = await appChain.transaction(alice, () => {
      lending.borrow(amountBorrowed, tokenIdToBorrow);
    });

    await tx3.sign();
    await tx3.send();

    const block3 = await appChain.produceBlock();
    expect(block3?.transactions[0].status.toBoolean()).toBe(true);

    const alicePositionBorrowing =
      await appChain.query.runtime.Lending.positions.get(alice);
    expect(alicePositionBorrowing?.borrow.toString()).toBe(
      amountBorrowed.toString()
    );

    // check amount borrowed is balance of alice of tokenIdBorrowed
    const aliceBalanceTokenB =
      await appChain.query.runtime.Balances.balances.get(keyBorrow);
    expect(aliceBalanceTokenB?.toString()).toBe(amountBorrowed.toString());

    // 4. test repay tx
    const amountRepay = amountBorrowed; // repay all the borrow amount
    const tx4 = await appChain.transaction(alice, () => {
      lending.repay(amountRepay, tokenIdToBorrow);
    });

    await tx4.sign();
    await tx4.send();

    const block4 = await appChain.produceBlock();
    expect(block4?.transactions[0].status.toBoolean()).toBe(true);

    const alicePositionAfterRepay =
      await appChain.query.runtime.Lending.positions.get(alice);
    // expectedBalance = old tokenB balance - amount repayed
    expect(alicePositionAfterRepay?.borrow.toString()).toBe(
      Balance.from(aliceBalanceTokenB!)
        .sub(Balance.from(amountRepay))
        .toString()
    );

    const aliceBalanceTokenBAfterRepay =
      await appChain.query.runtime.Balances.balances.get(keyBorrow);
    expect(aliceBalanceTokenBAfterRepay?.toString()).toBe(
      Balance.from(aliceBalanceTokenB!).sub(amountRepay)?.toString()
    );

    // 5. test withdraw tx
    const aliceBalanceTokenABeforeWithdraw =
      await appChain.query.runtime.Balances.balances.get(keyLend);

    const amountWithdraw = Balance.from(10);
    const tx5 = await appChain.transaction(alice, () => {
      lending.withdraw(amountWithdraw, tokenIdToLend);
    });

    await tx5.sign();
    await tx5.send();

    const block5 = await appChain.produceBlock();
    expect(block5?.transactions[0].status.toBoolean()).toBe(true);

    const alicePositionAfterWithdraw =
      await appChain.query.runtime.Lending.positions.get(alice);
    // expected lend balance = old lend balance - amount withdraw
    expect(alicePositionAfterWithdraw?.lend.toString()).toBe(
      Balance.from(alicePositionLending?.lend!)
        .sub(amountWithdraw)
        .toString()
    );

    const aliceBalanceTokenAAfterWithdraw =
      await appChain.query.runtime.Balances.balances.get(keyLend);
    // expected tokenA balance = old token A balance + amount withdraw
    expect(aliceBalanceTokenAAfterWithdraw?.toString()).toBe(
      Balance.from(aliceBalanceTokenABeforeWithdraw!)
        .add(amountWithdraw)
        ?.toString()
    );
  }, 1_000_000);
});
