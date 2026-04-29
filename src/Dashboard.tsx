import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

interface Tx {
  to: string;
  value: bigint;
  data: string;
  executed: boolean;
  numConfirmations: bigint;
  index: number;
}
// React hooks for state management and side effects
import { useState, useEffect, useCallback } from "react";
// Ethers.js for blockchain interaction and data formatting
import { ethers } from "ethers";

// Transaction interface defining the structure of a multisig transaction
interface Tx {
  to: string;              // Recipient address
  value: bigint;           // Amount in wei
  data: string;            // Transaction data payload
  executed: boolean;       // Whether transaction has been executed
  numConfirmations: bigint; // Number of owner confirmations received
  index: number;           // Transaction index in the contract
}

// Dashboard component for managing multisig wallet transactions
export default function Dashboard({ contract }: { contract: ethers.Contract }) {
  const [txs, setTxs] = useState<Tx[]>([]);
  // State for storing the list of transactions from the contract
  const [txs, setTxs] = useState<Tx[]>([]);
  // Form input state for new transaction recipient address
  const [to, setTo] = useState("");
  // Form input state for new transaction amount in ETH
  const [value, setValue] = useState("");
  // State for storing authorized wallet owners
  const [owners, setOwners] = useState<string[]>([]);
  const [required, setRequired] = useState<number>(0);
  // State for required number of confirmations to execute a transaction
  const [required, setRequired] = useState<number>(0);
  // Loading state for submit transaction button
  const [submitting, setSubmitting] = useState(false);
  // Loading state for individual transaction actions (confirm/execute/revoke)
  const [loadingTx, setLoadingTx] = useState<number | null>(null);

  const loadData = useCallback(async () => {
  // Fetches all wallet data: transactions, owners, and required confirmations
  const loadData = useCallback(async () => {
    if (!contract) return;

    try {
      // Fetching transaction count, owners, and the required confirmation threshold
      const [count, ownerList, requiredCount] = await Promise.all([
        contract.getTransactionCount(),
        contract.getOwners(),
        contract.required()
      ]);

      const txList = [];
      for (let i = 0; i < Number(count); i++) {
        const tx = await contract.getTransaction(i);
        txList.push({
          to: tx[0],
          value: tx[1],
          data: tx[2],
          executed: tx[3],
          numConfirmations: tx[4],
          index: i,
        });
      }
    try {
      // Fetching transaction count, owners, and the required confirmation threshold
      const [count, ownerList, requiredCount] = await Promise.all([
        contract.getTransactionCount(),
        contract.getOwners(),
        contract.required()
      ]);

      // Build transaction list by fetching each transaction detail
      const txList = [];
      for (let i = 0; i < Number(count); i++) {
        const tx = await contract.getTransaction(i);
        txList.push({
          to: tx[0],
          value: tx[1],
          data: tx[2],
          executed: tx[3],
          numConfirmations: tx[4],
          index: i,
        });
      }

      setTxs(txList);
      setOwners(ownerList);
      setRequired(Number(requiredCount));
    } catch (err: any) {
      console.error("Load failed:", err);
    }
  }, [contract]);

  useEffect(() => {
    loadData();
  }, [contract]);

  // Effect to load data on component mount and set up real-time updates
  useEffect(() => {
    if (!contract) return;

    loadData();
    // Initial data load
    loadData();

    const handler = () => loadData();
    // Handler function to refresh data on contract events
    const handler = () => loadData();

    // Event listeners for real-time updates
    // Event listeners for real-time updates from the smart contract
    contract.on("SubmitTransaction", handler);
    contract.on("ConfirmTransaction", handler);
    contract.on("ExecuteTransaction", handler);
    contract.on("RevokeConfirmation", handler);

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    contract.on("RevokeConfirmation", handler);

    // Polling interval as fallback for data synchronization (every 30 seconds)
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    // Cleanup function to remove listeners and clear interval on unmount
    return () => {
      contract.removeAllListeners();
      clearInterval(interval);
      contract.removeAllListeners();
      clearInterval(interval);
    };
  }, [contract, loadData]);
  }, [contract, loadData]);

  const submitTx = async () => {
  // Submits a new transaction proposal to the multisig contract
  const submitTx = async () => {
    try {
      if (!to || !value) {
      // Validate form inputs
      if (!to || !value) {
        alert("Fill all fields");
        return;
      }
      }

      setSubmitting(true);
      const tx = await contract.submitTransaction(
      setSubmitting(true);
      // Call contract method to submit transaction (converts ETH to wei)
      const tx = await contract.submitTransaction(
        to,
        ethers.parseEther(value),
        "0x"
      );
      );

      await tx.wait();
      setTo("");
      setValue("");
      await loadData();
      alert("Transaction submitted!");
    } catch (err: any) {
      console.error(err);
      alert("Submit failed: " + (err?.reason || err?.message));
      // Wait for transaction confirmation
      await tx.wait();
      // Clear form inputs after successful submission
      setTo("");
      setValue("");
      // Refresh transaction list
      await loadData();
      alert("Transaction submitted!");
    } catch (err: any) {
      console.error(err);
      alert("Submit failed: " + (err?.reason || err?.message));
    } finally {
      setSubmitting(false);
      setSubmitting(false);
    }
  };

  const confirmTx = async (id: number) => {
  };

  // Confirms an existing transaction as an authorized owner
  const confirmTx = async (id: number) => {
    try {
      setLoadingTx(id);
      const tx = await contract.confirmTransaction(id);
      await tx.wait();
      await loadData();
    } catch (err: any) {
      console.error("CONFIRM ERROR:", err);
      alert(err?.reason || err?.message || "Confirm failed");
      setLoadingTx(id);
      // Call contract method to confirm transaction
      const tx = await contract.confirmTransaction(id);
      await tx.wait();
      // Refresh transaction list after confirmation
      await loadData();
    } catch (err: any) {
      console.error("CONFIRM ERROR:", err);
      alert(err?.reason || err?.message || "Confirm failed");
    } finally {
      setLoadingTx(null);
      setLoadingTx(null);
    }
  };

  const executeTx = async (id: number) => {
  };

  // Executes a transaction after required confirmations threshold is met
  const executeTx = async (id: number) => {
    try {
      setLoadingTx(id);
      const tx = await contract.executeTransaction(id);
      await tx.wait();
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert("Execute failed: " + (err?.reason || err?.message));
      setLoadingTx(id);
      // Call contract method to execute transaction
      const tx = await contract.executeTransaction(id);
      await tx.wait();
      // Refresh transaction list after execution
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert("Execute failed: " + (err?.reason || err?.message));
    } finally {
      setLoadingTx(null);
      setLoadingTx(null);
    }
  };
  };

  const revokeTx = async (id: number) => {
  // Revokes a previous confirmation from the calling owner
  const revokeTx = async (id: number) => {
    try {
      setLoadingTx(id);
      const tx = await contract.revokeConfirmation(id);
      await tx.wait();
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert("Revoke failed: " + (err?.reason || err?.message));
      setLoadingTx(id);
      // Call contract method to revoke confirmation
      const tx = await contract.revokeConfirmation(id);
      await tx.wait();
      // Refresh transaction list after revocation
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert("Revoke failed: " + (err?.reason || err?.message));
    } finally {
      setLoadingTx(null);
      setLoadingTx(null);
    }
  };
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-20">
      {/* Authorized Owners Section */}
      {/* Authorized Owners Section */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3 text-gray-500 px-1">
          Authorized Owners ({required + 1} Required)
          Authorized Owners ({3} Required)
        </h2>
        <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-800 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {owners.map((o, i) => (
              <div key={i} className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-gray-800/50">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                  {i + 1}
                </span>
                <p className="text-xs font-mono text-gray-400 truncate">{o}</p>
                <p className="text-xs font-mono text-gray-400 truncate">{o}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Propose Transaction Section */}
      {/* Propose Transaction Section */}
      <div className="animate-in fade-in slide-in-from-top-6 duration-700">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3 text-gray-500 px-1">
          Propose Transaction
        </h2>
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-2xl space-y-4 ring-1 ring-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Recipient</label>
              <input
                className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-700 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-mono text-white placeholder:text-gray-600"
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Amount (ETH)</label>
              <input
                className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-700 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-mono text-white placeholder:text-gray-600"
                placeholder="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>
          <button
          <button
            onClick={submitTx}
            disabled={submitting}
            className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95
                ${submitting
                ? "bg-gray-700 text-gray-300 cursor-not-allowed shadow-none"
                : "bg-green-500 text-black hover:bg-green-400 shadow-green-500/20 hover:shadow-green-500/40"
              }`}
          >
                ${submitting
                ? "bg-gray-700 text-gray-300 cursor-not-allowed shadow-none"
                : "bg-green-500 text-black hover:bg-green-400 shadow-green-500/20 hover:shadow-green-500/40"
              }`}
          >
            {submitting ? (
              <>
              <>
                <span className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full"></span>
                Submitting...
              </>
              </>
            ) : (
              "Submit Proposal"
              "Submit Proposal"
            )}
          </button>
          </button>
        </div>
      </div>

  