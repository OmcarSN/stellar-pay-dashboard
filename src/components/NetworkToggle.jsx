import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export const NetworkToggle = ({ network, onChange }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNetwork, setPendingNetwork] = useState(null);

  const handleClick = (net) => {
    if (net === network) return;
    if (net === 'mainnet') {
      setPendingNetwork(net);
      setShowWarning(true);
    } else {
      onChange(net);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 bg-[#0a1628] border border-[#1a2d4a] rounded-full p-1">
        {['testnet', 'mainnet'].map(net => (
          <button 
            key={net} 
            onClick={() => handleClick(net)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              network === net 
                ? (net === 'mainnet' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-[#0081f1] text-white shadow-lg shadow-[#0081f1]/30')
                : 'text-[#6b8aab] hover:text-white'
            }`}
          >
            {net}
          </button>
        ))}
      </div>

      {showWarning && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0a1628] border border-orange-500 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="text-2xl text-orange-500">⚠️</span> Switch to Mainnet?
            </h3>
            <p className="text-[#6b8aab] text-sm">
              You are switching to Mainnet. Transactions here use real XLM. Proceed with caution.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowWarning(false)} className="flex-1 py-2 rounded-xl border border-[#1a2d4a] text-white font-semibold text-sm hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => { onChange(pendingNetwork); setShowWarning(false); }} className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors">Confirm Switch</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
