import React, { useState } from 'react';
import { isValidStellarAddress, splitPayment } from '../utils/stellar';
import { ProgressStepper } from './ProgressStepper';

export const SplitPaymentForm = ({ address, network, onSuccess, onError }) => {
  const [fields, setFields] = useState({ 
    contractId: localStorage.getItem('splitter_contract_id') || '', 
    amount: '', 
    tokenId: 'CAS3J7GYLGXW6P3ABPF4Y6CHYMTYIWSBBYRSTEYL2MBIU36YVABK6I2N' // Native XLM on Testnet
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0); 
  const [txHash, setTxHash] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!fields.contractId) errs.contractId = 'Contract ID required';
    if (!fields.tokenId) errs.tokenId = 'Token ID required';
    if (!fields.amount || isNaN(fields.amount) || parseFloat(fields.amount) <= 0) errs.amount = 'Valid amount required';
    return errs;
  };

  const handleSplit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    localStorage.setItem('splitter_contract_id', fields.contractId);

    setSubmitting(true);
    setTxHash(null);
    try {
      setStep(1); await new Promise(r => setTimeout(r, 600));
      setStep(2);
      // Invoking Soroban Split
      const res = await splitPayment(address, fields.contractId, fields.tokenId, parseFloat(fields.amount), network);
      setStep(3); await new Promise(r => setTimeout(r, 600));
      setStep(4);
      setTxHash(res.hash);
      onSuccess?.(res.hash);
      setTimeout(() => { setStep(0); setFields(f=>({...f, amount:''})); setTxHash(null); }, 6000);
    } catch (e) {
      setStep(0);
      onError?.(e.message || 'Split transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const explorerUrl = network === 'mainnet' ? 'https://stellar.expert/explorer/public/tx/' : 'https://stellar.expert/explorer/testnet/tx/';

  return (
    <div className="h-full flex flex-col rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-xl tracking-tight">Split Payment <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full uppercase ml-1 font-black">Soroban</span></h2>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {step > 0 && (
          <div className="py-8 animate-fade-in">
            <ProgressStepper currentStep={step} />
            {step === 4 && txHash && (
              <div className="mt-8 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-slide-up backdrop-blur-sm">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-emerald-400 font-bold mb-1 tracking-wide">Split Complete!</p>
                <a href={`${explorerUrl}${txHash}`} target="_blank" rel="noreferrer" className="text-xs text-purple-400 hover:text-white transition-colors underline break-all font-mono inline-block mt-2">
                  View on Explorer ↗
                </a>
              </div>
            )}
          </div>
        )}

        {step === 0 && (
          <form onSubmit={handleSplit} className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Splitter Contract ID</label>
              <input 
                name="contractId" type="text" value={fields.contractId} 
                onChange={e => {setFields(f=>({...f, contractId:e.target.value})); setErrors(er=>({...er, contractId:undefined}))}}
                className={`w-full bg-slate-900/50 border ${errors.contractId ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-purple-500'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-mono placeholder:text-slate-600`}
                placeholder="C... (Splitter Contract)" 
              />
              {errors.contractId && <p className="text-rose-400 text-xs ml-1 mt-1 font-medium">{errors.contractId}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset (Token ID)</label>
              <input 
                name="tokenId" type="text" value={fields.tokenId} 
                onChange={e => {setFields(f=>({...f, tokenId:e.target.value})); setErrors(er=>({...er, tokenId:undefined}))}}
                className={`w-full bg-slate-900/50 border ${errors.tokenId ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-purple-500'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-mono placeholder:text-slate-600`}
                placeholder="Native XLM by default" 
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Total Amount to Split</label>
              <div className="relative">
                <input 
                  name="amount" type="number" step="any" min="0.0000001" value={fields.amount} 
                  onChange={e => {setFields(f=>({...f, amount:e.target.value})); setErrors(er=>({...er, amount:undefined}))}}
                  className={`w-full bg-slate-900/50 border ${errors.amount ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-purple-500'} rounded-xl px-4 py-3.5 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600`}
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-xs font-bold">XLM/TOK</span>
                </div>
              </div>
              {errors.amount && <p className="text-rose-400 text-xs ml-1 mt-1 font-medium">{errors.amount}</p>}
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={!address || submitting || !fields.contractId || !fields.amount}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite]" />
                <span className="relative text-sm tracking-wide">
                  {!address ? 'CONNECT WALLET' : 'EXECUTE SMART SPLIT'}
                </span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center px-4 italic">
              Funds will be distributed according to the contract's pre-configured shares.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
