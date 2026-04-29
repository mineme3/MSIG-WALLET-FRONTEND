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

export default function Dashboard({ contract }: { contract: ethers.Contract }) {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [owners, setOwners] = useState<string[]>([]);
  const [required, setRequired] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingTx, setLoadingTx] = useState<number | null>(null);

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

      setTxs(txList);
      setOwners(ownerList);
      setRequired(Number(requiredCount));
    } catch (err: any) {
      console.error("Load failed:", err);
    }
  }, [contract]);

  useEffect(() => {
    if (!contract) return;

    loadData();

    const handler = () => loadData();

    // Event listeners for real-time updates
    contract.on("SubmitTransaction", handler);
    contract.on("ConfirmTransaction", handler);
    contract.on("ExecuteTransaction", handler);
    contract.on("RevokeConfirmation", handler);

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => {
      contract.removeAllListeners();
      clearInterval(interval);
    };
  }, [contract, loadData]);

  const submitTx = async () => {
    try {
      if (!to || !value) {
        alert("Fill all fields");
        return;
      }

      setSubmitting(true);
      const tx = await contract.submitTransaction(
        to,
        ethers.parseEther(value),
        "0x"
      );

      await tx.wait();
      setTo("");
      setValue("");
      await loadData();
      alert("Transaction submitted!");
    } catch (err: any) {
      console.error(err);
      alert("Submit failed: " + (err?.reason || err?.message));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmTx = async (id: number) => {
    try {
      setLoadingTx(id);
      const tx = await contract.confirmTransaction(id);
      await tx.wait();
      await loadData();
    } catch (err: any) {
      console.error("CONFIRM ERROR:", err);
      alert(err?.reason || err?.message || "Confirm failed");
    } finally {
      setLoadingTx(null);
    }
  };

  const executeTx = async (id: number) => {
    try {
      setLoadingTx(id);
      const tx = await contract.executeTransaction(id);
      await tx.wait();
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert("Execute failed: " + (err?.reason || err?.message));
    } finally {
      setLoadingTx(null);
    }
  };

  const revokeTx = async (id: number) => {
    try {
      setLoadingTx(id);
      const tx = await contract.revokeConfirmation(id);
      await tx.wait();
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert("Revoke failed: " + (err?.reason || err?.message));
    } finally {
      setLoadingTx(null);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-20">
      {/* Authorized Owners Section */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3 text-gray-500 px-1">
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
              </div>
            ))}
          </div>
        </div>
      </div>

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
            onClick={submitTx}
            disabled={submitting}
            className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95
                ${submitting
                ? "bg-gray-700 text-gray-300 cursor-not-allowed shadow-none"
                : "bg-green-500 text-black hover:bg-green-400 shadow-green-500/20 hover:shadow-green-500/40"
              }`}
          >
            {submitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full"></span>
                Submitting...
              </>
            ) : (
              "Submit Proposal"
            )}
          </button>
        </div>
      </div>

      {/* Transaction Queue Section */}
      <div className="animate-in fade-in slide-in-from-top-8 duration-1000">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Transaction Queue
          </h2>
          <span className="text-[10px] font-mono bg-gray-800 px-2 py-0.5 rounded text-gray-400">
            Total: {txs.length}
          </span>
        </div>

        <div className="space-y-4">
          {txs.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl">
              <p className="text-gray-600 text-sm italic">No transactions found in registry</p>
            </div>
          ) : (
            txs.slice().reverse().map((tx) => (
              <div
                key={tx.index}
                className={`group relative bg-gray-900 p-6 rounded-3xl border transition-all duration-300 ${tx.executed
                    ? "border-gray-800/50 opacity-60 grayscale-[0.5]"
                    : "border-gray-800 hover:border-gray-600 hover:shadow-2xl shadow-black"
                  }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-tighter mb-1">Queue ID: #{tx.index}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-mono font-bold text-white leading-none">
                        {ethers.formatEther(tx.value).toString()}
                      </span>
                      <span className="text-[10px] font-bold text-gray-600">ETH</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${tx.executed
                      ? "bg-success/5 text-success border-success/20"
                      : "bg-warning/5 text-warning border-warning/20"
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${tx.executed ? "bg-success" : "bg-warning"}`}></div>
                    {tx.executed ? "EXECUTED" : "PENDING"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Destination</span>
                    <p className="text-xs font-mono text-gray-300 break-all bg-black/30 p-2 rounded-lg border border-gray-800/50">
                      {tx.to}
                    </p>
                  </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Approvals</span>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-white leading-none">
                      {/* Shows current / required (e.g., 1 / 3) */}
                      {tx.numConfirmations.toString()} <span className="text-gray-600 text-sm">/ {3}</span>
                    </p>
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          tx.executed ? 'bg-green-500' : 
                          Number(tx.numConfirmations) >= 3 ? 'bg-yellow-400' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min((Number(tx.numConfirmations) / 3) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800/50">
                  <button
                    disabled={tx.executed || loadingTx === tx.index}
                    className="flex-1 md:flex-none bg-primary text-black font-black text-[10px] uppercase px-6 py-2.5 rounded-xl hover:brightness-110 active:scale-95 disabled:opacity-20 disabled:grayscale transition-all"
                    onClick={() => confirmTx(tx.index)}
                  >
                    {loadingTx === tx.index ? "Approving..." : "Approve"}
                  </button>
                  <button
                    disabled={tx.executed || Number(tx.numConfirmations) < required || loadingTx === tx.index}
                    className="flex-1 md:flex-none bg-white text-black font-black text-[10px] uppercase px-6 py-2.5 rounded-xl hover:bg-gray-200 active:scale-95 disabled:opacity-10 disabled:grayscale transition-all"
                    onClick={() => executeTx(tx.index)}
                  >
                    {loadingTx === tx.index ? "Executing..." : "Execute"}
                  </button>
                  <button
                    disabled={tx.executed || loadingTx === tx.index}
                    className="flex-1 md:flex-none bg-danger/10 text-danger border border-danger/20 font-black text-[10px] uppercase px-6 py-2.5 rounded-xl hover:bg-danger hover:text-white active:scale-95 disabled:opacity-10 transition-all"
                    onClick={() => revokeTx(tx.index)}
                  >
                    {loadingTx === tx.index ? "Revoking..." : "Revoke"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}