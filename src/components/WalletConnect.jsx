import React from 'react';
import { useWallet } from '../hooks/useWallet';

const truncate = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

export const WalletConnect = ({ onConnect, onDisconnect }) => {
  const { address, connecting, error, connect, disconnect } = useWallet();

  React.useEffect(() => {
    if (address) onConnect?.(address);
    else onDisconnect?.();
  }, [address]);

  return (
    <div className="flex items-center gap-3">
      {address ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 hover:bg-slate-800/80 transition-colors shadow-lg">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-3 h-3 rounded-full bg-emerald-400 opacity-40 animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-sm font-mono font-medium text-slate-200">{truncate(address)}</span>
          </div>
          <button
            onClick={() => {
              disconnect();
              onDisconnect?.();
            }}
            className="text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all px-4 py-2.5 rounded-full border border-transparent hover:border-rose-500/20"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-end gap-1.5 relative">
          <button
            onClick={connect}
            disabled={connecting}
            className="group relative flex items-center justify-center gap-2 overflow-hidden bg-white text-slate-900 font-bold px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-60 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite] group-hover:translate-x-[150%] transition-transform duration-1000" />
            <span className="relative flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm-9-1a2 2 0 0 1 4 0v1h-4zm6 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
              </svg>
              {connecting ? 'Connecting...' : 'Connect Freighter'}
            </span>
          </button>
          
          {error && (
            <div className="absolute top-full right-0 mt-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 backdrop-blur-md shadow-xl max-w-[200px]">
              <p className="text-[11px] leading-tight text-rose-300 text-right font-medium">
                {error.includes('installed') ? (
                  <>Freighter not found. <br/><a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="underline hover:text-white transition-colors">Install Extension →</a></>
                ) : error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
