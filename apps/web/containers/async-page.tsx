"use client";
import { Action } from "@/components/action";
import { Faucet } from "@/components/faucet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFaucet } from "@/lib/stores/balances";
import { useFaucetUsdc } from "@/lib/stores/balancesUSDC";
import {
  useBorrow,
  useLend,
  useRepay,
  useWithdraw,
} from "@/lib/stores/lending";
import { useWalletStore } from "@/lib/stores/wallet";

export default function Home() {
  const wallet = useWalletStore();
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
          <div className="mx-auto grid h-full w-full min-w-[25vw] grid-cols-2 items-center justify-center gap-4 px-16 pt-16">
            <div className="flex flex-col items-center justify-center">
              <Action
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
