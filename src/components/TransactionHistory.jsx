import React from 'react';
import { useTransactions } from '../hooks/useTransactions';

export const TransactionHistory = ({ address, network }) => {
  const { transactions, loading, error, fetchTransactions } = useTransactions(address, network);

  const explorerUrl = network === 'mainnet' ? 'https://stellar.expert/explorer/public/tx/' : 'https://stellar.expert/explorer/testnet/tx/';

  return (
    <div className="h-full flex flex-col rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl relative">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-xl tracking-tight">Recent History</h2>
        </div>
        
        {address && (
          <button 
            onClick={() => fetchTransactions(true)} 
            disabled={loading}
            className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10"
          >
            {loading ? 'Refreshing...' : 'Refresh Cache'}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {!address ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <p className="text-sm font-medium">Connect wallet to view history</p>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-4 p-4 items-center">
                <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                  <div className="h-2 w-48 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-rose-400 text-sm text-center bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{error}</p>
        ) : transactions.length === 0 ? (
          <div className="text-center flex flex-col items-center justify-center h-full py-20 animate-fade-in-up delay-100">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
              <span className="text-3xl">🌌</span>
            </div>
            <p className="text-white font-bold text-lg mb-1 tracking-tight">No transactions yet</p>
            <p className="text-slate-400 text-sm">Your blockchain history will appear here once you send or receive XLM.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, i) => {
              const isSent = tx.from === address;
              const counterparty = isSent ? tx.to : tx.from;
              const amt = tx.amount || tx.starting_balance || 0;

              return (
                <a 
                  key={tx.id || i} 
                  href={`${explorerUrl}${tx.transaction_hash}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#0081f1]/30 hover:bg-[#0081f1]/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#0081f1]/5 relative overflow-hidden"
                >
                  <div className={`absolute left-0 inset-y-0 w-1 ${isSent ? 'bg-rose-500/50' : 'bg-emerald-500/50'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl shadow-inner border border-white/5 ${isSent ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {isSent ? <svg className="w-5 h-5 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg> : <svg className="w-5 h-5 opacity-90 rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${isSent ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                        {isSent ? 'Sent' : 'Received'}
                      </span>
                      <span className="text-slate-500 text-[11px] font-medium hidden sm:inline-block">
                        • {tx.created_at ? new Date(tx.created_at).toLocaleString(undefined, {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                    
                    <p className="text-slate-400 text-xs font-mono truncate max-w-[200px] sm:max-w-[250px] group-hover:text-slate-300 transition-colors">
                      {isSent ? 'To: ' : 'From: '}{counterparty ? <span className="font-bold text-slate-300">{counterparty.slice(0,8)}...{counterparty.slice(-6)}</span> : 'Unknown Source'}
                    </p>
                  </div>
                  
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className={`font-black text-base sm:text-lg tracking-tight ${isSent ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isSent ? '−' : '+'}{parseFloat(amt).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-[10px] opacity-70">XLM</span>
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
