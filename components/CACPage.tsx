import React, { useEffect, useState } from 'react';
import cacService, { CAC_PER_KWH, MONTHLY_CAP_CAC } from '../services/cacService';

const CACPage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [monthly, setMonthly] = useState<number>(0);
  const [txs, setTxs] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => {
    setBalance(cacService.getBalance());
    setMonthly(cacService.getMonthlyRedeemed());
    setTxs(cacService.getTransactions());
  };

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cac_balance' || e.key === 'cac_monthly_redeemed' || e.key === 'cac_transactions') refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleRedeem = (kwh = 1) => {
    const res = cacService.redeemForKwh(kwh);
    if (res.ok) {
      setMessage(`Redeemed ${res.cacSpent} CAC → ${kwh} kWh`);
      refresh();
    } else {
      setMessage(res.error || 'Unable to redeem');
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="flex-1 p-12">
      <h1 className="text-3xl font-bold mb-4">Clean Air Credits (CAC)</h1>
      <p className="text-white/70 mb-6 max-w-2xl">Clean Air Credits reward verifiable civic actions in Delhi — e.g., reporting pollution or joining local missions. CAC are stored locally in this demo; in production they should be backed by a server ledger and verification flow.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold">Your Balance</h3>
          <div className="mt-3 flex items-center gap-4">
            <div className="text-4xl font-extrabold">{balance}</div>
            <div className="text-sm text-white/60">CAC</div>
          </div>
          <div className="mt-4 text-xs text-white/60">Progress to next kWh: <strong>{balance % CAC_PER_KWH}/{CAC_PER_KWH}</strong></div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold">How to Earn</h3>
          <ul className="mt-3 space-y-3 text-white/70 text-sm">
            <li><strong>Submit a pollution report</strong> → 3 CAC</li>
            <li><strong>Join a clean-air mission</strong> → 2 CAC</li>
            <li className="text-xs text-white/50">All awards are recorded and cannot be double-counted for a single action.</li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold">Redeem & Limits</h3>
          <div className="mt-3 text-sm text-white/70">Conversion: <strong>{CAC_PER_KWH} CAC → 1 kWh</strong></div>
          <div className="mt-2 text-sm text-white/70">Monthly cap: <strong>{MONTHLY_CAP_CAC} CAC → {MONTHLY_CAP_CAC / CAC_PER_KWH} kWh</strong></div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => handleRedeem(1)} className="bg-primary px-4 py-2 rounded-xl font-bold">Redeem 15 CAC → 1 kWh</button>
            <div className="text-sm text-white/60">Redeemed this month: <strong>{monthly}</strong> CAC</div>
          </div>
        </div>
      </div>

      {message && <div className="mb-6 px-4 py-3 rounded bg-white/5 text-sm font-medium">{message}</div>}

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-bold">Transactions</h3>
        <div className="mt-4 space-y-3">
          {txs.length === 0 ? (
            <div className="text-sm text-white/50">No transactions yet. Submit a report or join a mission to earn CAC.</div>
          ) : (
            txs.slice(0, 50).map(tx => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <div className="font-bold text-sm">{tx.type === 'award' ? (tx.note || 'Award') : 'Redeem'}</div>
                  <div className="text-[10px] text-white/40 mt-1">{new Date(tx.timestamp).toLocaleString()}</div>
                </div>
                <div className={`font-mono font-bold ${tx.type === 'award' ? 'text-primary' : 'text-emerald-400'}`}>+{tx.amount} CAC</div>
              </div>
            ))
          )}
        </div>
      </div>

      
    </div>
  );
};

export default CACPage;
