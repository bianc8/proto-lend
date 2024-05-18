import { inject } from "tsyringe";
import {
  BlockProverExecutionData,
  ProvableTransactionHook,
} from "@proto-kit/protocol";
import { Lending } from "./lending";
import { Runtime, RuntimeModulesRecord } from "@proto-kit/module";
import { Balance } from "@proto-kit/library";

export class TransactionInterestModule extends ProvableTransactionHook {
  private lending: Lending;

  public constructor(
    @inject("Runtime") runtime: Runtime<RuntimeModulesRecord>
  ) {
    super();
    this.lending = runtime.resolveOrFail("Lending", Lending);
  }

  public onTransaction({ transaction }: BlockProverExecutionData): void {
    const activePosition = this.lending.positions.get(transaction.sender.value);
    if (
      activePosition.value.borrow.greaterThanOrEqual(Balance.from(0)) &&
      activePosition.value.borrow.greaterThanOrEqual(
        Balance.from(activePosition.value.lend)
      )
    ) {
      // if borrow amount is greater than 80% of lend amount
      // then user must repay the whole amount
      this.lending.positions.set(transaction.sender.value, {
        user: transaction.sender.value,
        lend: Balance.from(0),
        borrow: Balance.from(0),
      });
    } else {
      // if borrow amount is less than 80% of lend amount
      // then user have interest of 5% on each transaction
      this.lending.positions.set(transaction.sender.value, {
        user: transaction.sender.value,
        lend: activePosition.value.lend,
        borrow: Balance.from(activePosition.value.borrow).mul(5).div(100),
      });
    }
  }
}
