import { useState } from "react";
import { ethers } from "ethers";
import { MultiSigWalletABI } from "./abi/MultiSigWallet";
import { CONTRACT_ADDRESS } from "./config";
import Dashboard from "./Dashboard";

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const walletContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MultiSigWalletABI,
        signer
      );

      setAccount(address);
      setContract(walletContract);
    } catch (err) {
      console.error("Connection failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between mb-16 border-b border-gray-900 pb-8 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tighter text-white">
              MSIG <span className="text-blue-500">WALLET</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">
              v0.0.0 • Testnet Protocol
            </p>
          </div>

          <button
            onClick={connectWallet}
            className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-2xl ${
              account 
              ? "bg-gray-900 text-green-400 border border-green-500/20" 
              : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/20"
            }`}
          >
            {account ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </header>

        <main className="transition-all duration-500">
          {contract ? (
            <Dashboard contract={contract} />
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-700">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gray-900 rounded-3xl rotate-12 border border-gray-800 flex items-center justify-center shadow-2xl">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-blue-500 opacity-10 blur-2xl rounded-full"></div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-200">Awaiting Connection</h2>
              <p className="text-gray-500 max-w-sm mt-3 leading-relaxed">
                Unlock your authorized owner wallet to access the multisig registry and manage pending transactions.
              </p>
              
              <div className="mt-10 flex gap-4 text-[10px] font-mono text-gray-700 uppercase tracking-tighter">
                <span>Ethereum</span>
                <span>•</span>
                <span>Ethers.js v6</span>
                <span>•</span>
                <span>Secured</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;