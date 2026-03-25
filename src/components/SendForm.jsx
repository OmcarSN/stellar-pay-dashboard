import React, { useState } from 'react';
import { isValidStellarAddress, sendPayment } from '../utils/stellar';
import { ProgressStepper } from './ProgressStepper';

export const SendForm = ({ address, network, onSuccess, onError }) => {
  const [fields, setFields] = useState({ recipient: '', amount: '', memo: '' });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0); 
  const [txHash, setTxHash] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!fields.recipient) errs.recipient = 'Required';
    else if (!isValidStellarAddress(fields.recipient)) errs.recipient = 'Invalid Stellar address';
    if (!fields.amount || isNaN(fields.amount) || parseFloat(fields.amount) <= 0) errs.amount = 'Valid amount required';
    if (fields.memo && fields.memo.length > 28) errs.memo = 'Max 28 chars';
    return errs;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setTxHash(null);
    try {
      setStep(1); await new Promise(r => setTimeout(r, 600));
      setStep(2);
      const res = await sendPayment(address, fields.recipient, fields.amount, fields.memo, network);
      setStep(3); await new Promise(r => setTimeout(r, 600));
      setStep(4);
      setTxHash(res.hash);
      onSuccess?.(res.hash);
      setTimeout(() => { setStep(0); setFields({recipient:'', amount:'', memo:''}); setTxHash(null); }, 6000);
    } catch (e) {
      setStep(0);
      onError?.(e.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const explorerUrl = network === 'mainnet' ? 'https://stellar.expert/explorer/public/tx/' : 'https://stellar.expert/explorer/testnet/tx/';

  return (
    <div className="h-full flex flex-col rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#0081f1]/50 to-transparent opacity-50" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#0081f1]/20 flex items-center justify-center text-[#0081f1]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-xl tracking-tight">Transfer Funds</h2>
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
                <p className="text-emerald-400 font-bold mb-1 tracking-wide">Transfer Successful!</p>
                <a href={`${explorerUrl}${txHash}`} target="_blank" rel="noreferrer" className="text-xs text-[#0081f1] hover:text-white transition-colors underline break-all font-mono inline-block mt-2">
                  View on Explorer ↗
                </a>
              </div>
            )}
          </div>
        )}

        {step === 0 && (
          <form onSubmit={handleSend} className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Recipient Address</label>
              <div className="relative">
                <input 
                  name="recipient" type="text" value={fields.recipient} 
                  onChange={e => {setFields(f=>({...f, recipient:e.target.value})); setErrors(er=>({...er, recipient:undefined}))}}
                  className={`w-full bg-slate-900/50 border ${errors.recipient ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#0081f1]'} rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#0081f1]/50 transition-all font-mono placeholder:text-slate-600 placeholder:font-sans`}
                  placeholder="G..." aria-label="Recipient Address" 
                />
              </div>
              {errors.recipient && <p className="text-rose-400 text-xs ml-1 mt-1 font-medium">{errors.recipient}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount (XLM)</label>
                <div className="relative">
                  <input 
                    name="amount" type="number" step="any" min="0.0000001" value={fields.amount} 
                    onChange={e => {setFields(f=>({...f, amount:e.target.value})); setErrors(er=>({...er, amount:undefined}))}}
                    className={`w-full bg-slate-900/50 border ${errors.amount ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#0081f1]'} rounded-xl px-4 py-3.5 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#0081f1]/50 transition-all placeholder:text-slate-600 placeholder:font-sans`}
                    placeholder="0.00" aria-label="Amount in XLM"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 text-xs font-bold">XLM</span>
                  </div>
                </div>
                {errors.amount && <p className="text-rose-400 text-xs ml-1 mt-1 font-medium">{errors.amount}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Memo (Optional)</label>
                <input 
                  name="memo" type="text" maxLength={28} value={fields.memo} 
                  onChange={e => {setFields(f=>({...f, memo:e.target.value})); setErrors(er=>({...er, memo:undefined}))}}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#0081f1] focus:ring-1 focus:ring-[#0081f1]/50 transition-all placeholder:text-slate-600"
                  placeholder="Message..." aria-label="Optional memo"
                />
                {errors.memo && <p className="text-rose-400 text-xs ml-1 mt-1 font-medium">{errors.memo}</p>}
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={!address || submitting || !fields.recipient || !fields.amount}
                className="group relative w-full overflow-hidden rounded-xl bg-[#0081f1] text-white font-bold py-4 transition-all hover:bg-[#0070d4] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,129,241,0.3)] hover:shadow-[0_0_30px_rgba(0,129,241,0.5)] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite] group-hover:translate-x-[150%] transition-transform duration-1000" />
                <span className="relative text-sm tracking-wide">
                  {!address ? 'CONNECT WALLET TO SEND' : 'INITIATE TRANSFER'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
