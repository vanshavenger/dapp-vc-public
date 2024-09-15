import React from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { SolanaFeatures } from './components/SolanaFeatures';
import { ThemeProvider } from './components/ui/theme-provider';
import { Wallet, Coins, Send, FileSignature } from 'lucide-react';

const WalletButtons = () => {
  const { connected } = useWallet();

  return (
    <div className="flex space-x-2">
      <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger custom-wallet-button" />
      {connected && (
        <WalletDisconnectButton className="wallet-adapter-button custom-wallet-button" />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL;

  const features = [
    { icon: <Coins className="w-6 h-6 solana-dapp-feature-icon" />, title: "Request Airdrop", description: "Get SOL tokens for testing" },
    { icon: <Wallet className="w-6 h-6 solana-dapp-feature-icon" />, title: "Show SOL Balance", description: "View your current SOL balance" },
    { icon: <Send className="w-6 h-6 solana-dapp-feature-icon" />, title: "Send Transaction", description: "Transfer SOL to another wallet" },
    { icon: <FileSignature className="w-6 h-6 solana-dapp-feature-icon" />, title: "Sign Message", description: "Verify wallet ownership" },
  ];

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ConnectionProvider endpoint={rpcUrl}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen solana-dapp-background text-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-teal-500/10 rounded-full filter blur-3xl"></div>

              <header className="relative z-10 flex justify-between items-center p-6 solana-dapp-header">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-8 w-8 text-teal-400" />
                  <h1 className="text-3xl font-light tracking-wide text-teal-100">Solana DApp</h1>
                </div>
                <WalletButtons />
              </header>

              <main className="relative z-10 container mx-auto px-4 py-12">
                <section className="text-center mb-16">
                  <h2 className="text-4xl font-light mb-8 text-teal-100">Explore Solana Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="solana-dapp-feature-card rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300"
                      >
                        <div className="mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-light mb-2 text-teal-100">{feature.title}</h3>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="solana-dapp-feature-card rounded-lg shadow-xl p-8">
                  <h2 className="text-2xl font-light mb-6 text-center text-teal-100">Solana Features</h2>
                  <SolanaFeatures />
                </section>
              </main>

              <footer className="relative z-10 text-center p-4 text-gray-500 text-sm solana-dapp-footer">
                <p>© {new Date().getFullYear()} Vansh Chopra. All rights reserved.</p>
              </footer>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}

export default App;