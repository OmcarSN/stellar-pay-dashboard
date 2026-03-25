import React, { useState, useCallback } from 'react';

const ICONS = { success: '✅', error: '❌', info: 'ℹ️' };

export const Toast = ({ toasts, removeToast }) => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0a1628] border border-[#1a2d4a] shadow-2xl pointer-events-auto">
        <span className="text-base">{ICONS[t.type]}</span>
        <span className="text-sm text-white max-w-xs">{t.message}</span>
        <button onClick={() => removeToast(t.id)} className="text-[#6b8aab] hover:text-white ml-2">&times;</button>
      </div>
    ))}
  </div>
);

let idCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    return id;
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};
