import React from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolanaFeatures } from "@/components/SolanaFeatures";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Wallet, Coins, Send, FileSignature } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

const WalletButtons = () => {
  return (
    <div className="flex space-x-2">
      <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger custom-wallet-button" />
    </div>
  );
};

const App: React.FC = () => {
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL;

  const features = [
    {
      icon: <Coins className="w-8 h-8 text-primary" />,
      title: "Request Airdrop",
      description: "Get SOL tokens for testing",
    },
    {
      icon: <Wallet className="w-8 h-8 text-primary" />,
      title: "Show SOL Balance",
      description: "View your current SOL balance",
    },
    {
      icon: <Send className="w-8 h-8 text-primary" />,
      title: "Send Transaction",
      description: "Transfer SOL to another wallet",
    },
    {
      icon: <FileSignature className="w-8 h-8 text-primary" />,
      title: "Sign Message",
      description: "Verify wallet ownership",
    },
  ];

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ConnectionProvider endpoint={rpcUrl}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-gradient-to-br from-background to-secondary text-foreground relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-secondary/20 rounded-full filter blur-3xl animate-pulse"></div>
              </div>

              <div className="relative z-10">
                <header className="flex justify-between items-center p-6 bg-background/80 backdrop-blur-lg border-b border-border/50">
                  <div className="flex items-center space-x-3">
                    <Wallet className="h-10 w-10 text-primary" />
                    <h1 className="text-3xl font-light tracking-wide text-primary">
                      Solana DApp
                    </h1>
                  </div>
                  <WalletButtons />
                </header>

                <main className="container mx-auto px-4 py-12">
                  <section className="text-center mb-16">
                    <h2 className="text-4xl font-light mb-8 text-primary">
                      Explore Solana Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="bg-secondary/30 backdrop-blur-md rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300 border border-border/50 group hover:bg-secondary/50"
                        >
                          <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                          </div>
                          <h3 className="text-xl font-light mb-2 text-primary group-hover:text-accent transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                            {feature.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-secondary/30 backdrop-blur-md rounded-lg shadow-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-light mb-6 text-center text-primary">
                      Solana Features
                    </h2>
                    <SolanaFeatures />
                  </section>
                </main>

                <footer className="text-center p-4 text-muted-foreground text-sm bg-background/80 backdrop-blur-lg border-t border-border/50">
                  <p>
                    © {new Date().getFullYear()} Vansh Chopra. All rights
                    reserved.
                  </p>
                </footer>
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <Toaster richColors position="top-center" closeButton expand />
    </ThemeProvider>
  );
};

export default App;