"use client";
import { Action } from "@/components/action";
import { Faucet } from "@/components/faucet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBalancesStore, useFaucet } from "@/lib/stores/balances";
import { useBalancesStoreUsdc, useFaucetUsdc } from "@/lib/stores/balancesUSDC";
import {
  useBorrow,
  useLend,
  usePositionStore,
  useRepay,
  useWithdraw,
} from "@/lib/stores/lending";
import { useWalletStore } from "@/lib/stores/wallet";
import { Balance } from "@proto-kit/library";

export default function Home() {
  const wallet = useWalletStore();
  const positions = usePositionStore();
  const balances = useBalancesStore();

  let maxLend = Balance.from(0);
  let maxWithdraw = Balance.from(0);
  let maxBorrow = Balance.from(0);
  let maxRepay = Balance.from(0);
  let activeBalanceMina = "NA";
  if (wallet.wallet) {
    const activePosition = positions.positions[wallet.wallet ?? ""];
    activeBalanceMina = balances.balances[wallet.wallet ?? ""];
    if (activePosition && activePosition.borrow && activePosition.lend) {
      maxRepay = Balance.from(activePosition.borrow);
      maxBorrow = Balance.from(activePosition.lend)
        .sub(Balance.from(activePosition.borrow))
        .mul(80)
        .div(100);
      maxLend = Balance.from(activePosition.borrow).mul(100).div(80);
      maxWithdraw = Balance.from(activePosition.lend).sub(maxLend);
    }
  }

  const drip = useFaucet();
  const dripUsdc = useFaucetUsdc();
  const lend = useLend();
  const borrow = useBorrow();
  const repay = useRepay();
  const withdraw = useWithdraw();

  return (
    <div className="mx-auto flex h-full w-full items-center justify-center pt-16 text-center align-middle">
      <Tabs defaultValue="faucet" className="w-full">
        <TabsList>
          <TabsTrigger value="faucet">Faucet</TabsTrigger>
          <TabsTrigger value="lend">Lend</TabsTrigger>
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
        </TabsList>
        <TabsContent value="faucet">
          <div className="mx-auto grid h-full w-full min-w-[25vw] grid-cols-2 items-center justify-center gap-4 px-16 pt-16">
            <div className="flex flex-col items-center justify-center">
              <Faucet
                wallet={wallet.wallet}
                onConnectWallet={wallet.connectWallet}
                onDrip={drip}
                loading={false}
                token={"MINA"}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <Faucet
                wallet={wallet.wallet}
                onConnectWallet={wallet.connectWallet}
                onDrip={dripUsdc}
                loading={false}
                token={"USDC"}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="lend">
          <div className="mx-auto grid h-full w-full grid-cols-2 items-center justify-center gap-4 px-16 pt-16">
            <div className="flex flex-col items-center justify-center">
              <Action
                token={"MINA"}
                maxValue={parseFloat(activeBalanceMina)}
                title={"Deposit MINA"}
                subtitle={"Lend your MINA to earn interest"}
                buttonTitle={"Add liquidity"}
                wallet={wallet.wallet}
                onConnectWallet={wallet.connectWallet}
                onDrip={lend}
                loading={false}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <Action
                token={"MINA"}
                maxValue={parseFloat(maxWithdraw.toString())}
                title={"Withdraw MINA"}
                subtitle={"Withdraw your MINA from the lending pool"}
                buttonTitle={"Remove liquidity"}
                wallet={wallet.wallet}
                onConnectWallet={wallet.connectWallet}
                onDrip={withdraw}
                loading={false}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="borrow">
          <div className="mx-auto grid h-full w-full min-w-[25vw] grid-cols-2 items-center justify-center gap-4 px-16 pt-16">
            <div className="flex flex-col items-center justify-center">
              <Action
                token={"USDC"}
                maxValue={parseFloat(maxBorrow.toString())}
                title={"Borrow USDC"}
                subtitle={"Borrow USDC against your collateral"}
                buttonTitle={"Borrow"}
                wallet={wallet.wallet}
                onConnectWallet={wallet.connectWallet}
                onDrip={borrow}
                loading={false}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <Action
                token={"USDC"}
                maxValue={parseFloat(maxRepay.toString())}
                title={"Repay UDSC"}
                subtitle={"Repay your borrowed USDC"}
                buttonTitle={"Repay"}
                wallet={wallet.wallet}
                onConnectWallet={wallet.connectWallet}
                onDrip={repay}
                loading={false}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
