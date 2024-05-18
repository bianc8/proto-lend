"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { useState } from "react";

export interface ActionProps {
  token: string;
  maxValue: number;
  title: string;
  subtitle: string;
  buttonTitle: string;
  wallet?: string;
  loading: boolean;
  onConnectWallet: () => void;
  onDrip: (amount: number) => void;
}

export function Action({
  token,
  maxValue,
  title,
  subtitle,
  buttonTitle,
  wallet,
  onConnectWallet,
  onDrip,
  loading,
}: ActionProps) {
  const form = useForm();
  const [value, setValue] = useState(0);
  return (
    <Card className="w-full bg-[#EEF4FF] p-4 text-left text-[#1F3148]">
      <div className="mb-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>
      <Form {...form}>
        <div className="pt-3">
          <FormField
            name="value"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel>Amount </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => {
                      setValue(parseFloat(e.target.value));
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="mt-1 text-left text-sm text-zinc-500">
            Max: {maxValue ? `${maxValue} ${token}` : "NA"}
          </div>
        </div>

        <Button
          size={"lg"}
          type="submit"
          className="mt-6 w-full bg-[#3C648E] text-white hover:bg-[#2A4365]"
          loading={loading}
          onClick={() => {
            wallet ?? onConnectWallet();
            wallet && onDrip(value);
          }}
        >
          {wallet ? buttonTitle : "Connect wallet"}
        </Button>
      </Form>
    </Card>
  );
}
