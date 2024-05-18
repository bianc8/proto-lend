import { Button } from "@/components/ui/button";
import protoLend from "@/public/logo-wordart.png";
import Image from "next/image";
// @ts-ignore
import truncateMiddle from "truncate-middle";
import { Skeleton } from "@/components/ui/skeleton";
import { Chain } from "./chain";
import { Separator } from "./ui/separator";

export interface HeaderProps {
  loading: boolean;
  wallet?: string;
  onConnectWallet: () => void;
  balance?: string;
  balanceUsdc?: string;
  balanceLoading: boolean;
  blockHeight?: string;
}

export default function Header({
  loading,
  wallet,
  onConnectWallet,
  balance,
  balanceUsdc,
  balanceLoading,
  blockHeight,
}: HeaderProps) {
  return (
    <div className="container grid grid-cols-2 py-2">
      <div className="flex items-center justify-start gap-2 align-middle">
        <Image
          className="h-[12vh] w-auto rounded-xl"
          src={protoLend}
          alt={"Protokit logo"}
        />
        <Separator className="ml-4 h-8" orientation={"vertical"} />
        <Chain height={blockHeight} />
      </div>
      <div className="flex flex-row items-center justify-end">
        {/* balance */}
        {wallet && (
          <div className="mr-4 flex shrink flex-col items-end justify-center">
            <div>
              <p className="text-xs">Your balance</p>
            </div>
            <div className="w-32 pt-0.5 text-right">
              {balanceLoading && balance === undefined ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <p className="text-xs font-bold">{balance} MINA</p>
              )}
              {balanceLoading && balanceUsdc === undefined ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <p className="text-xs font-bold">{balanceUsdc} USDC</p>
              )}
            </div>
          </div>
        )}
        {/* connect wallet */}
        <Button
          loading={loading}
          className="w-44 bg-[#3C648E] text-white hover:bg-[#2A4365]"
          onClick={onConnectWallet}
        >
          <div>
            {wallet ? truncateMiddle(wallet, 7, 7, "...") : "Connect wallet"}
          </div>
        </Button>
      </div>
    </div>
  );
}
