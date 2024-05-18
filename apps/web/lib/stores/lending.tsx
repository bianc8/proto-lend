import { create } from "zustand";
import { Client, useClientStore } from "./client";
import { immer } from "zustand/middleware/immer";
import { PendingTransaction, UnsignedTransaction } from "@proto-kit/sequencer";
import { Balance, BalancesKey, TokenId } from "@proto-kit/library";
import { PublicKey, UInt64 } from "o1js";
import { useCallback, useEffect } from "react";
import { useChainStore } from "./chain";
import { useWalletStore } from "./wallet";
import { Position } from "chain";

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
  lend: (
    client: Client,
    address: string,
    amount: number,
  ) => Promise<PendingTransaction>;
  borrow: (
    client: Client,
    address: string,
    amount: number,
  ) => Promise<PendingTransaction>;
  repay: (
    client: Client,
    address: string,
    amount: number,
  ) => Promise<PendingTransaction>;
  withdraw: (
    client: Client,
    address: string,
    amount: number,
  ) => Promise<PendingTransaction>;
}

function isPendingTransaction(
  transaction: PendingTransaction | UnsignedTransaction | undefined,
): asserts transaction is PendingTransaction {
  if (!(transaction instanceof PendingTransaction))
    throw new Error("Transaction is not a PendingTransaction");
}

export const tokenId_MINA = TokenId.from(0);
export const tokenId_USDC = TokenId.from(1);

export const usePositionStore = create<
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

      const position = (await client.query.runtime.Lending.positions.get(
        PublicKey.fromBase58(address),
      )) as unknown as Position | undefined;

      set((state) => {
        state.loading = false;
        state.positions[address] = {
          user: address,
          lend: position && position.lend ? position.lend : 0,
          borrow: position && position.borrow ? position.borrow : 0,
        };
      });
    },
    async lend(client: Client, address: string, amount: number) {
      const lending = client.runtime.resolve("Lending");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        lending.lend(Balance.from(amount), tokenId_MINA);
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },
    async borrow(client: Client, address: string, amount: number) {
      const lending = client.runtime.resolve("Lending");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        lending.borrow(Balance.from(amount), tokenId_USDC);
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },
    async repay(client: Client, address: string, amount: number) {
      const lending = client.runtime.resolve("Lending");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        lending.repay(Balance.from(amount), tokenId_USDC);
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },
    async withdraw(client: Client, address: string, amount: number) {
      const lending = client.runtime.resolve("Lending");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        lending.withdraw(Balance.from(amount), tokenId_MINA);
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },
  })),
);

export const useObservePosition = () => {
  const client = useClientStore();
  const chain = useChainStore();
  const wallet = useWalletStore();
  const positions = usePositionStore();

  useEffect(() => {
    if (!client.client || !wallet.wallet) return;

    positions.loadPositions(client.client, wallet.wallet);
  }, [client.client, chain.block?.height, wallet.wallet]);
};

export const useLend = () => {
  const client = useClientStore();
  const positions = usePositionStore();
  const wallet = useWalletStore();

  return useCallback(
    async (amount: number) => {
      if (!client.client || !wallet.wallet) return;

      const pendingTransaction = await positions.lend(
        client.client,
        wallet.wallet,
        amount,
      );

      wallet.addPendingTransaction(pendingTransaction);
    },
    [client.client, wallet.wallet],
  );
};

export const useBorrow = () => {
  const client = useClientStore();
  const positions = usePositionStore();
  const wallet = useWalletStore();

  return useCallback(
    async (amount: number) => {
      if (!client.client || !wallet.wallet) return;

      const pendingTransaction = await positions.borrow(
        client.client,
        wallet.wallet,
        amount,
      );

      wallet.addPendingTransaction(pendingTransaction);
    },
    [client.client, wallet.wallet],
  );
};

export const useRepay = () => {
  const client = useClientStore();
  const positions = usePositionStore();
  const wallet = useWalletStore();

  return useCallback(
    async (amount: number) => {
      if (!client.client || !wallet.wallet) return;

      const pendingTransaction = await positions.repay(
        client.client,
        wallet.wallet,
        amount,
      );

      wallet.addPendingTransaction(pendingTransaction);
    },
    [client.client, wallet.wallet],
  );
};

export const useWithdraw = () => {
  const client = useClientStore();
  const positions = usePositionStore();
  const wallet = useWalletStore();

  return useCallback(
    async (amount: number) => {
      if (!client.client || !wallet.wallet) return;

      const pendingTransaction = await positions.withdraw(
        client.client,
        wallet.wallet,
        amount,
      );

      wallet.addPendingTransaction(pendingTransaction);
    },
    [client.client, wallet.wallet],
  );
};
