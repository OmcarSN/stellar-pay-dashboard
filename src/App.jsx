import React, { useState, useCallback } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { BalanceCard } from './components/BalanceCard';
import { SendForm } from './components/SendForm';
import { TransactionHistory } from './components/TransactionHistory';
import { NetworkToggle } from './components/NetworkToggle';
import { Toast, useToast } from './components/Toast';

function StarField() {
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i, 
    x: Math.random() * 100, 
    y: Math.random() * 100, 
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex: -1}}>
      {stars.map(s => (
        <div key={s.id} 
             className="absolute rounded-full bg-white animate-pulse" 
             style={{
               left: `${s.x}%`, 
               top: `${s.y}%`, 
               width: `${s.size}px`, 
               height: `${s.size}px`,
               opacity: Math.random() * 0.4 + 0.1,
               animationDelay: `${s.delay}s`,
               animationDuration: `${s.duration}s`
             }} />
      ))}
    </div>
  );
}

function App() {
  const [address, setAddress] = useState(() => localStorage.getItem('stellar_wallet_address') || null);
  const [network, setNetwork] = useState('testnet');
  const { toasts, addToast, removeToast } = useToast();

  const handleConnect = useCallback(addr => setAddress(addr), []);
  const handleDisconnect = useCallback(() => setAddress(null), []);

  const handleNetworkChange = net => {
    setNetwork(net);
    addToast(`Switched to ${net === 'mainnet' ? '🔴 Mainnet' : '🟢 Testnet'}`, 'info');
  };

  const handleSuccess = hash => addToast(`Transaction confirmed! Hash: ${hash.slice(0, 8)}...`, 'success', 8000);
  const handleError = msg => addToast(`Transaction failed: ${msg}`, 'error', 7000);

  return (
    <div className="min-h-screen bg-[#020617] relative font-sans text-slate-200 selection:bg-[#0081f1]/30">
      <StarField />
      
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#0081f1]/10 blur-[140px] pointer-events-none mix-blend-screen" style={{zIndex: -1}} />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none mix-blend-screen" style={{zIndex: -1}} />

      <header className="border-b border-white/5 bg-[#020617]/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 group cursor-pointer transition-transform hover:scale-[1.02]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0081f1] to-purple-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-[#0081f1]/30">
              ☄️
            </div>
            <div>
              <h1 className="text-white font-black tracking-tight text-xl leading-tight">
                Stellar <span className="font-light opacity-80">Dashboard</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <NetworkToggle network={network} onChange={handleNetworkChange} />
            <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
          </div>
        </div>
      </header>

      {!address && (
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-16 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              A Next-Gen <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0081f1] via-indigo-400 to-purple-400 drop-shadow-sm">
                Blockchain Experience
              </span>
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              Seamlessly interact with the Stellar network. View your XLM balances, trace 
              transactions, and send payments with zero friction. Connect your wallet to begin.
            </p>
          </div>
        </div>
      )}

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {address && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-8 flex flex-col h-full">
              <BalanceCard address={address} network={network} />
              <div className="flex-1">
                <SendForm address={address} network={network} onSuccess={handleSuccess} onError={handleError} />
              </div>
            </div>
            <div className="lg:col-span-7 h-full">
              <TransactionHistory address={address} network={network} />
            </div>
          </div>
        )}
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
