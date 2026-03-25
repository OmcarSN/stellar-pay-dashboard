import React from 'react';
import { useBalance } from '../hooks/useBalance';

export const BalanceCard = ({ address, network }) => {
  const { balance, loading, error, fetchBalance } = useBalance(address, network);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl group">
      {/* Decorative gradient blob inside card */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0081f1]/20 rounded-full blur-[50px] mix-blend-screen opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-2 text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
          </svg>
          <p className="text-xs uppercase tracking-widest font-semibold">Available Balance</p>
        </div>
      </div>
      
      <div className="relative z-10">
        {loading || balance === null ? (
          <div className="animate-pulse space-y-4 py-2">
            <div className="h-14 bg-white/5 rounded-2xl w-3/4" />
            <div className="h-5 bg-white/5 rounded-lg w-1/4" />
          </div>
        ) : error ? (
          <div className="text-rose-400 text-sm py-4 bg-rose-500/10 rounded-xl px-4 border border-rose-500/20">{error}</div>
        ) : (
          <div className="flex flex-col items-start transform transition-transform group-hover:scale-[1.02] origin-left duration-300">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 font-mono tracking-tight drop-shadow-sm">
                {parseFloat(balance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
            <span className="text-lg font-bold text-[#0081f1] tracking-wide ml-1">XLM LUMENS</span>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 relative z-10 flex justify-between items-center">
        <NetworkBadge network={network} />
        {address && (
          <button
            onClick={() => fetchBalance(true)}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        )}
      </div>
    </div>
  );
};

const NetworkBadge = ({ network }) => (
  <div className="flex items-center gap-2">
    <span className={`w-2 h-2 rounded-full ${network === 'mainnet' ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-[#0081f1] shadow-[0_0_8px_#0081f1]'}`} />
    <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
      {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
    </span>
  </div>
);
