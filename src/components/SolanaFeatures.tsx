import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import bs58 from 'bs58';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Buffer } from 'buffer';

window.Buffer = Buffer;

export const SolanaFeatures: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signMessage } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [airdropAmount, setAirdropAmount] = useState('');

  const fetchBalance = useCallback(async () => {
    if (publicKey) {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setAlert({ type: 'error', message: 'Failed to fetch balance' });
      }
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchBalance();
    const id = setInterval(fetchBalance, 2000); 
    return () => clearInterval(id);
  }, [fetchBalance]);

  const handleSendTransaction = async () => {
    if (!publicKey) {
      setAlert({ type: 'error', message: 'Wallet not connected' });
      return;
    }
    try {
      const toPublicKey = new PublicKey(recipient);
      const lamports = LAMPORTS_PER_SOL * parseFloat(amount);
      
      if (isNaN(lamports) || lamports <= 0) {
        throw new Error('Invalid amount');
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPublicKey,
          lamports,
        })
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);
      
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      setAlert({ type: 'success', message: 'Transaction sent successfully!' });
      fetchBalance();
    } catch (error) {
      console.error('Transaction error:', error);
      setAlert({ type: 'error', message: `Failed to send transaction: ${(error as Error).message}` });
    }
  };

  const handleSignMessage = async () => {
    if (!signMessage) {
      setAlert({ type: 'error', message: 'Wallet does not support message signing' });
      return;
    }
    try {
      const encodedMessage = new TextEncoder().encode(message);
      console.log("Encoded message:", encodedMessage);  
      const signedMessage = await signMessage(encodedMessage);
      setSignature(bs58.encode(signedMessage));
      setAlert({ type: 'success', message: 'Message signed successfully!' });
    } catch (error) {
      console.error('Signing error:', error);
      setAlert({ type: 'error', message: `Failed to sign message: ${(error as Error).message}` });
    }
  };

  const handleAirdrop = async () => {
    if (!publicKey) {
      setAlert({ type: 'error', message: 'Wallet not connected' });
      return;
    }
    try {
      const lamports = LAMPORTS_PER_SOL * parseFloat(airdropAmount);
      if (isNaN(lamports) || lamports <= 0) {
        throw new Error('Invalid airdrop amount');
      }
      const signature = await connection.requestAirdrop(publicKey, lamports);
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) {
        throw new Error('Airdrop failed');
      }
      setAlert({ type: 'success', message: 'Airdrop successful!' });
      fetchBalance();
    } catch (error) {
      console.error('Airdrop error:', error);
      setAlert({ type: 'error', message: `Airdrop failed: ${(error as Error).message}` });
    }
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert variant={alert.type === 'success' ? "default" : "destructive"}>
          <AlertTitle>{alert.type === 'success' ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
          <CardDescription>Your current SOL balance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {balance !== null ? `${balance.toFixed(9)} SOL` : 'Connect wallet to view balance'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Airdrop</CardTitle>
          <CardDescription>Request SOL airdrop (Devnet only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            placeholder="Amount (SOL)"
            value={airdropAmount}
            onChange={(e) => setAirdropAmount(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAirdrop} className="w-full">Request Airdrop</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Transaction</CardTitle>
          <CardDescription>Transfer SOL to another wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Amount (SOL)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSendTransaction} className="w-full">Send SOL</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign Message</CardTitle>
          <CardDescription>Sign a message with your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter message to sign"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {signature && (
            <div className="p-2 bg-muted rounded-md">
              <h3 className="font-semibold">Signature:</h3>
              <p className="text-sm break-all">{signature}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSignMessage} className="w-full">Sign Message</Button>
        </CardFooter>
      </Card>
    </div>
  );
};