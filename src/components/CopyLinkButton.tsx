'use client';
import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="mt-4 sm:mt-0 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 px-4 rounded-lg transition-colors border border-slate-700"
    >
      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
      {copied ? 'SKOPIOWANO!' : 'ZAPISZ MÓJ LINK'}
    </button>
  );
}
