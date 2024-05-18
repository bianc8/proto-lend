"use client";
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
        <TabsList className="">
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
          <div>
            <button onClick={lend} className="mt-8 w-40 border border-red-200">
              Lend
            </button>
            <button
              onClick={withdraw}
              className="mt-8 w-40 border border-red-200"
            >
              Withdraw
            </button>
          </div>
        </TabsContent>
        <TabsContent value="borrow">
          <div>
            <button
              onClick={borrow}
              className="mt-8 w-40 border border-red-200"
            >
              Borrow
            </button>
            <button onClick={repay} className="mt-8 w-40 border border-red-200">
              Repay
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
