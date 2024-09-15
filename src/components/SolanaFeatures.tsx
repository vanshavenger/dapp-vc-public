import React, { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import bs58 from "bs58";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Buffer } from "buffer";
import { TRANSACTION_TIME } from "@/constants";
import { Loader2, RefreshCw, Send, FileSignature, Coins } from "lucide-react";
import { ed25519 } from "@noble/curves/ed25519";

window.Buffer = Buffer;

export const SolanaFeatures: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signMessage } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [airdropAmount, setAirdropAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (publicKey) {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
        toast.error("Failed to fetch balance");
      }
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchBalance();
    const id = setInterval(fetchBalance, 5000);
    return () => clearInterval(id);
  }, [fetchBalance]);

  const handleSendTransaction = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }
    setIsLoading(true);
    try {
      const toPublicKey = new PublicKey(recipient);
      const lamports = LAMPORTS_PER_SOL * parseFloat(amount);

      if (isNaN(lamports) || lamports <= 0) {
        throw new Error("Invalid amount");
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPublicKey,
          lamports,
          programId: SystemProgram.programId
        }),
      );
      const signature = await sendTransaction(transaction, connection);

      const startTime = Date.now();
      while (true) {
        const { value: statuses } = await connection.getSignatureStatuses([
          signature,
        ]);

        if (statuses[0]?.confirmationStatus === "confirmed") {
          break;
        }

        if (Date.now() - startTime > TRANSACTION_TIME) {
          throw new Error("Transaction timed out");
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      toast.success("Transaction sent successfully!");
      fetchBalance();
      setAmount("");
      setRecipient("");
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error(`Failed to send transaction: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignMessage = async () => {
    if (!signMessage) {
      toast.error("Wallet does not support message signing");
      return;
    }
    setIsLoading(true);
    try {
      if (publicKey === null) {
        toast.error("Wallet not connected");
        return
      }
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await signMessage(encodedMessage);
      setSignature(bs58.encode(signedMessage));
      if (!ed25519.verify(signedMessage, encodedMessage, publicKey.toBytes())) throw new Error('Message signature invalid!');
      toast.success("Message signed successfully!");
    } catch (error) {
      console.error('Signing error:', error);
      toast.error(`Failed to sign message: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAirdrop = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }
    setIsLoading(true);
    try {
      const lamports = LAMPORTS_PER_SOL * parseFloat(airdropAmount);
      if (isNaN(lamports) || lamports <= 0) {
        throw new Error("Invalid airdrop amount");
      }

      const airdropSignature = await connection.requestAirdrop(
        publicKey,
        lamports,
      );
      const startTime = Date.now();
      while (true) {
        const { value: statuses } = await connection.getSignatureStatuses([
          airdropSignature,
        ]);

        if (statuses[0]?.confirmationStatus === "confirmed") {
          break;
        }

        if (Date.now() - startTime > TRANSACTION_TIME) {
          throw new Error("Airdrop transaction timed out");
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      toast.success("Airdrop was confirmed!");
      fetchBalance();
      setAirdropAmount("");
    } catch (error) {
      console.error("Airdrop error:", error);
      toast.error(`Airdrop failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-full bg-secondary/30 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Wallet Balance</span>
            <Button variant="ghost" size="icon" onClick={fetchBalance} className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>Your current SOL balance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">
            {balance !== null
              ? `${balance.toFixed(9)} SOL`
              : "Connect wallet to view balance"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-secondary/30 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Airdrop
          </CardTitle>
          <CardDescription>Request SOL airdrop (Devnet only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            placeholder="Amount (SOL)"
            value={airdropAmount}
            onChange={(e) => setAirdropAmount(e.target.value)}
            className="bg-background/50"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAirdrop} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coins className="mr-2 h-4 w-4" />}
            Request Airdrop
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-secondary/30 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send Transaction
          </CardTitle>
          <CardDescription>Transfer SOL to another wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-background/50"
          />
          <Input
            type="number"
            placeholder="Amount (SOL)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background/50"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSendTransaction} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send SOL
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-secondary/30 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            Sign Message
          </CardTitle>
          <CardDescription>Sign a message with your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter message to sign"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-background/50"
          />
          {signature && (
            <div className="p-2 bg-background/50 rounded-md">
              <h3 className="font-semibold text-primary mb-1">Signature:</h3>
              <p className="text-sm break-all">{signature}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSignMessage} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSignature className="mr-2 h-4 w-4" />}
            Sign Message
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};