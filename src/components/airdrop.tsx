import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useState } from "react";

export const Airdrop = () => {
  const wallet = useWallet();
  const connection = new Connection(import.meta.env.VITE_SOLANA_RPC_URL);
  const [amount, setAmount] = useState<number>(0);

  const sendAirdrop = async () => {
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(wallet?.publicKey?.toBase58() as string),
      amount * LAMPORTS_PER_SOL,
    );
    console.log(fromAirDropSignature);
    const fromAirDropStatus =
      await connection.confirmTransaction(fromAirDropSignature);
    console.log(fromAirDropStatus);
  };

  return (
    <div>
      <input
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        type="text"
        placeholder="Enter wallet address"
      />
      <button onClick={sendAirdrop}>Send Airdrop</button>
    </div>
  );
};
