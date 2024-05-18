import { create } from "zustand";
import { Client, useClientStore } from "./client";
import { immer } from "zustand/middleware/immer";
import { PendingTransaction, UnsignedTransaction } from "@proto-kit/sequencer";
import { Balance, BalancesKey, TokenId } from "@proto-kit/library";
import { PublicKey, UInt64 } from "o1js";
import { useCallback, useEffect } from "react";
import { useChainStore } from "./chain";
import { useWalletStore } from "./wallet";
import { Position } from "chain/dist/lending";

export interface LendingState {
  loading: boolean;
  positions: {
    // address - Position{user, lend, borrow}
    [key: string]: {
      user: string;
      lend: number;
      borrow: number;
    };
  };
  loadPositions: (client: Client, address: string) => Promise<void>;
  // lend: (
  //   client: Client,
  //   address: string,
  //   amount: number,
  // ) => Promise<PendingTransaction>;
  // borrow: (
  //   client: Client,
  //   address: string,
  //   amount: number,
  // ) => Promise<PendingTransaction>;
  // repay: (
  //   client: Client,
  //   address: string,
  //   amount: number,
  // ) => Promise<PendingTransaction>;
  // withdraw: (
  //   client: Client,
  //   address: string,
  //   amount: number,
  // ) => Promise<PendingTransaction>;
}

function isPendingTransaction(
  transaction: PendingTransaction | UnsignedTransaction | undefined,
): asserts transaction is PendingTransaction {
  if (!(transaction instanceof PendingTransaction))
    throw new Error("Transaction is not a PendingTransaction");
}

export const tokenId_MINA = TokenId.from(0);
export const tokenId_USDC = TokenId.from(1);

export const useBalancesStore = create<
  LendingState,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    loading: Boolean(false),
    positions: {},
    async loadPositions(client: Client, address: string) {
      set((state) => {
        state.loading = true;
      });

      const key_MINA = BalancesKey.from(
        tokenId_MINA,
        PublicKey.fromBase58(address),
      );
      const key_USDC = BalancesKey.from(
        tokenId_USDC,
        PublicKey.fromBase58(address),
      );

      const position = await client.query.runtime.Lending.positions.get(
        PublicKey.fromBase58(address),
      );

      set((state) => {
        state.loading = false;
        state.positions[address] = {
          user: address,
          lend: 0,
          borrow: 0,
        };
      });
    },
    // async faucet(client: Client, address: string) {
    //   const balances = client.runtime.resolve("Balances");
    //   const sender = PublicKey.fromBase58(address);

    //   const tx = await client.transaction(sender, () => {
    //     balances.addBalance(tokenId_MINA, sender, Balance.from(1000));
    //   });

    //   await tx.sign();
    //   await tx.send();

    //   isPendingTransaction(tx.transaction);
    //   return tx.transaction;
    // },
  })),
);

export const useObserveBalance = () => {
  const client = useClientStore();
  const chain = useChainStore();
  const wallet = useWalletStore();
  const balances = useBalancesStore();

  useEffect(() => {
    if (!client.client || !wallet.wallet) return;

    balances.loadBalance(client.client, wallet.wallet);
  }, [client.client, chain.block?.height, wallet.wallet]);
};

export const useFaucet = () => {
  const client = useClientStore();
  const balances = useBalancesStore();
  const wallet = useWalletStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await balances.faucet(
      client.client,
      wallet.wallet,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};
