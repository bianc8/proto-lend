import "reflect-metadata"; //fix typescript error
import {
  RuntimeModule,
  runtimeModule,
  state,
  runtimeMethod,
} from "@proto-kit/module";
import { State, StateMap, Option, assert } from "@proto-kit/protocol";
import { inject } from "tsyringe";
import { Balances } from "./balances";
import { Balance, TokenId, UInt64 } from "@proto-kit/library";
import { Field, Provable, PublicKey, Struct } from "o1js";

export class PositionId extends Field {}
export class Position extends Struct({
  user: PublicKey,
  lend: UInt64,
  borrow: UInt64,
}) {}

@runtimeModule()
export class Lending extends RuntimeModule<Record<string, never>> {
  @state() public positions = StateMap.from<PublicKey, Position>(
    PublicKey,
    Position
  );

  public constructor(@inject("Balances") private balances: Balances) {
    super();
  }

  @runtimeMethod()
  public lend(amount: UInt64, tokenId: TokenId) {
    const user = this.transaction.sender.value;
    assert(
      amount.lessThanOrEqual(this.balances.getBalance(tokenId, user)),
      "Maximum amount <= than balance"
    );
    const currentPosition = this.positions.get(user);
    const newPosition = new Position({
      user,
      lend:
        currentPosition && currentPosition.value
          ? Balance.from(currentPosition.value.lend).add(amount)
          : amount,
      borrow:
        currentPosition && currentPosition.value
          ? Balance.from(currentPosition.value.borrow)
          : UInt64.from(0),
    });

    this.balances.burn(tokenId, user, amount);
    this.positions.set(user, newPosition);
  }

  @runtimeMethod()
  public borrow(amount: UInt64, tokenId: TokenId) {
    const user = this.transaction.sender.value;
    const currentPosition = this.positions.get(user);
    // maxBorrowable is 80% of lend amount
    const maxBorrowable = Balance.from(currentPosition.value.lend)
      .mul(80)
      .div(100);

    // check if tot borrowed amount is less than maxBorrowable
    const calcAmount = Balance.from(currentPosition.value.borrow).add(amount);
    assert(
      calcAmount.lessThan(Balance.from(maxBorrowable)),
      "Maximum amount < than 80% of lent"
    );
    const newPosition = new Position({
      user,
      lend:
        currentPosition && currentPosition.value
          ? Balance.from(currentPosition.value.lend)
          : Balance.from(0),
      borrow:
        currentPosition && currentPosition.value
          ? Balance.from(currentPosition.value.borrow).add(amount)
          : amount,
    });

    this.balances.mint(tokenId, user, amount);
    this.positions.set(user, newPosition);
  }
}
