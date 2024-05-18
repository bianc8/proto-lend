import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { useBalancesStore, useObserveBalance } from "@/lib/stores/balances";
import {
  useBalancesStoreUsdc,
  useObserveBalanceUsdc,
} from "@/lib/stores/balancesUSDC";
import { useChainStore, usePollBlockHeight } from "@/lib/stores/chain";
import { useClientStore } from "@/lib/stores/client";
import { useNotifyTransactions, useWalletStore } from "@/lib/stores/wallet";
import { ReactNode, useEffect, useMemo } from "react";

export default function AsyncLayout({ children }: { children: ReactNode }) {
  const wallet = useWalletStore();
  const client = useClientStore();
  const chain = useChainStore();
  const balances = useBalancesStore();
  const balancesUsdc = useBalancesStoreUsdc();

  usePollBlockHeight();
  useObserveBalance();
  useObserveBalanceUsdc();
  useNotifyTransactions();

  useEffect(() => {
    client.start();
  }, []);

  useEffect(() => {
    wallet.initializeWallet();
    wallet.observeWalletChange();
  }, []);

  const loading = useMemo(
    () => client.loading || balances.loading || balancesUsdc.loading,
    [client.loading, balances.loading, balancesUsdc.loading],
  );

  return (
    <>
      <Header
        loading={client.loading}
        balance={balances.balances[wallet.wallet ?? ""]}
        balanceUsdc={balancesUsdc.balances[wallet.wallet ?? ""]}
        balanceLoading={loading}
        wallet={wallet.wallet}
        onConnectWallet={wallet.connectWallet}
        blockHeight={chain.block?.height ?? "-"}
      />
      {children}
      <Toaster />
    </>
  );
}
