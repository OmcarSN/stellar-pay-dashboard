import React from 'react';

const STEPS = [
  { label: 'Validating', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Signing', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
  { label: 'Network', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

export const ProgressStepper = ({ currentStep }) => (
  <div className="flex justify-between relative mx-2">
    <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/10 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-[#0081f1] to-purple-500 transition-all duration-700 ease-out shadow-[0_0_10px_#0081f1]"
        style={{ width: `${(Math.max(0, currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
      />
    </div>
    
    {STEPS.map((step, i) => {
      const isComplete = currentStep > i + 1;
      const isActive = currentStep === i + 1;
      
      const dotStyles = isComplete 
        ? 'bg-gradient-to-br from-[#0081f1] to-purple-500 border-transparent text-white shadow-[0_0_15px_rgba(0,129,241,0.4)] scale-110' 
        : isActive 
        ? 'bg-slate-900 border-[#0081f1] text-[#0081f1] shadow-[0_0_20px_rgba(0,129,241,0.2)] scale-110 ring-4 ring-[#0081f1]/20' 
        : 'bg-slate-900 border-white/10 text-slate-600 scale-95';

      return (
        <div key={i} className="flex flex-col items-center gap-3 z-10 transition-all duration-500 delay-100">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[2px] transition-all duration-500 ${dotStyles}`}>
            {isComplete ? (
              <svg className="w-5 h-5 animate-slide-up" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
              </svg>
            )}
          </div>
          <span className={`text-[10px] uppercase font-black tracking-widest transition-colors duration-300 ${
            isActive ? 'text-[#0081f1]' : isComplete ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {step.label}
          </span>
        </div>
      );
    })}
  </div>
);
